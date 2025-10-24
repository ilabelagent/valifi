"""
all_in_one.py
----------------

This script bundles together three separate pieces of functionality that you
previously used independently: running a LitServe‑based agent API, chatting
with that local agent via a simple client, and talking directly to external
LLMs via the litai library.  Running it will start the agent server in a
background thread on port 8000, send a test message to that agent, and then
invoke both a Gemini model and a Claude model using the same `LLM` API.

Prerequisites
-------------

Before running this script, ensure you have installed the following Python
packages in your environment:

* `litserve` 0.2.0 or later
* `agents` (your local package with LlamaCppChatCompletion and tools)
* `litai` for unified LLM access
* `requests` for HTTP requests

You should also set up any API keys required for the remote LLMs via
environment variables or the Lightning AI interface, otherwise those calls
will fail.  See the litai documentation for details.
"""

import json
import threading
import time
from typing import List, Dict

import requests

# Before importing your local `agents` package, ensure that this
# directory is at the front of sys.path.  Python resolves modules
# relative to the first entries in sys.path, so adding the current
# file's directory ensures that your local `agents` package is
# imported instead of a similarly named package installed via pip.
import os
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

import litserve as ls

# The following imports assume there is a local `agents` package in the
# same directory as this script containing your agent's implementation.
from agents.llms import LlamaCppChatCompletion
from agents.tools import (
    get_current_weather,
    google_search,
    wikipedia_search,
    image_inspector,
)
from agents.tool_executor import need_tool_use

# Import the unified LLM interface from litai.  This lets you call
# multiple providers (Anthropic, Google, OpenAI, etc.) through the same
# API without worrying about provider‑specific SDKs.  Make sure your
# environment has the necessary credentials for any models you use.
from litai import LLM


class AgentAPI(ls.LitAPI):
    """A simple LitAPI that delegates generation to a LlamaCpp model.

    This class wires up a llama.cpp chat completion engine and binds
    several example tools.  The `predict` method follows the same
    pattern as your original server.py: generate a chat completion,
    inspect whether a tool invocation is required, run the tools, and
    then ask the model to answer based on the tool outputs.
    """

    def setup(self, device: str) -> None:
        # Create the llama.cpp chat completion object.  Adjust n_ctx as
        # needed for your environment or model size.  The `from_default_llm`
        # helper will search for a compatible GGML file on your system.
        self.llm = LlamaCppChatCompletion.from_default_llm(n_ctx=0)
        # Bind the example tools.  Adding more tools here will make them
        # available to the model via the tool‑use protocol.
        self.llm.bind_tools([
            get_current_weather,
            google_search,
            wikipedia_search,
            image_inspector,
        ])

    def predict(self, messages: List[Dict[str, str]]):
        """Handle a prediction request from LitServe.

        Messages should follow the OpenAI chat API format: a list of
        dictionaries with `role` and `content` keys.  The method yields
        a single string containing the model's response.  Tool usage
        follows the need_tool_use / run_tools pattern from your original
        example.
        """
        # First, ask the model for a chat completion on the provided
        # conversation history.
        output = self.llm.chat_completion(messages)

        # If the model decided a tool call is appropriate, run the
        # requested tools.  The need_tool_use function inspects the
        # structured response for tool calls.
        if need_tool_use(output):
            tool_results = self.llm.run_tools(output) or []
            # Append the tool results to the conversation so the model
            # can incorporate them into its next answer.  Each tool
            # result should already be formatted as a chat message.
            updated_messages = list(messages) + tool_results
            updated_messages.append(
                {
                    "role": "user",
                    "content": "please answer me, based on the tool results.",
                }
            )
            # Get a fresh completion that takes tool outputs into account.
            output = self.llm.chat_completion(updated_messages)

        # Yield the text of the first choice.  In rare cases the model may
        # return no choices; handle that gracefully.
        if output.choices:
            yield output.choices[0].message.content
        else:
            yield "I'm sorry, I couldn't generate a response."


def run_server() -> None:
    """Instantiate and run the LitServe server.

    This function blocks until the server exits.  To avoid blocking
    your main thread, run it in a separate thread or process.
    """
    api = AgentAPI()
    server = ls.LitServer(api, spec=ls.OpenAISpec())
    # Running on localhost at port 8000; adjust as needed.
    server.run(port=8000)


def chat_with_agent(prompt: str) -> None:
    """Send a single message to the local agent and print its response."""
    url = "http://127.0.0.1:8000/predict"
    headers = {"Content-Type": "application/json"}
    messages = [{"role": "user", "content": prompt}]
    data = {"messages": messages}
    try:
        response = requests.post(url, headers=headers, data=json.dumps(data))
        response.raise_for_status()
    except requests.exceptions.RequestException as err:
        print(f"Error contacting local agent: {err}")
        return
    try:
        result = response.json()
        # The result is a dictionary with a `choices` key if the spec
        # matches the OpenAI API.  Fall back to printing raw JSON if
        # necessary.
        choices = result.get("choices") if isinstance(result, dict) else None
        if choices:
            print(f"Local agent response: {choices[0]['message']['content']}")
        else:
            print(f"Local agent raw JSON: {result}")
    except Exception:
        print(f"Unexpected response from agent: {response.text}")


def chat_with_models() -> None:
    """Demonstrate chatting with Gemini and Claude via litai."""
    # Chat with Google's Gemini model.  Other Gemini model strings
    # include "google/gemini-1.5-flash" or "google/gemini-1.5-pro".
    try:
        gemini_llm = LLM(model="google/gemini-2.5-flash")
        gemini_answer = gemini_llm.chat("What is the capital of France?")
        print(f"Gemini says: {gemini_answer}")
    except Exception as e:
        print(f"Error invoking Gemini model: {e}")

    # Chat with Anthropic's Claude model.  You can substitute other
    # Claude versions here (e.g. "anthropic/claude-3-opus-20240229").
    try:
        claude_llm = LLM(model="anthropic/claude-3-5-sonnet-20240620")
        claude_answer = claude_llm.chat(
            "Explain the concept of quantum entanglement in simple terms."
        )
        print(f"Claude says: {claude_answer}")
    except Exception as e:
        print(f"Error invoking Claude model: {e}")


def main() -> None:
    """Top‑level entry point that runs everything in sequence."""
    # Start the agent server in a background thread.  The daemon flag
    # allows the program to exit even if the server is still running.
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()

    # Give the server a moment to start up before sending a request.
    print("Starting local agent server on http://127.0.0.1:8000 ...")
    time.sleep(5)

    # Test the local agent with a simple prompt.  Feel free to modify
    # the prompt or call this function multiple times.
    chat_with_agent("What's the weather in London?")

    # Demonstrate direct LLM calls via litai.  These calls are
    # independent of the local agent and rely on your configured
    # Lightning credentials.
    chat_with_models()

    # Keep the server alive until the user interrupts the script.  A
    # simple loop with join() lets the main thread wait on the server
    # thread without busy‑waiting.
    print("\nThe server will continue running. Press Ctrl+C to stop.")
    try:
        server_thread.join()
    except KeyboardInterrupt:
        print("\nExiting. Goodbye!")


if __name__ == "__main__":
    main()