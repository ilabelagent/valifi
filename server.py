import litserve as ls
from agents.llms import LlamaCppChatCompletion
from agents.tools import get_current_weather, wikipedia_search, google_search, image_inspector
from agents.tool_executor import need_tool_use

class AgentAPI(ls.LitAPI):
    def setup(self, device):
        # we're setting up the language model and binding it to our tools.
        # the n_ctx=0 might be adjusted based on your specific llama.cpp setup
        # or if you want to explicitly set the context window size.
        self.llm = LlamaCppChatCompletion.from_default_llm(n_ctx=0)
        self.llm.bind_tools([get_current_weather, google_search, wikipedia_search, image_inspector])

    def predict(self, messages):
        # this is where the agent decides what to do.
        # first, it tries to get a chat completion from the llm.
        output = self.llm.chat_completion(messages)
        
        # then, it checks if the llm decided to use a tool.
        if need_tool_use(output):
            # if a tool is needed, it runs the tool(s).
            tool_results = self.llm.run_tools(output)
            # it then adds the tool results to the conversation history.
            updated_messages = messages + tool_results
            # and asks the llm to answer based on the new information from the tools.
            messages = updated_messages + [{"role": "user", "content": "please answer me, based on the tool results."}]
            output = self.llm.chat_completion(messages)
        
        # finally, it yields the content of the llm's response.
        yield output.choices[0].message.content

if __name__ == "__main__":
    # here we instantiate our agentapi and wrap it in a litserver.
    # we're also using the openspec for api documentation.
    api = AgentAPI()
    server = ls.LitServer(api, spec=ls.OpenAISpec())
    # the server will run on port 8000.
    server.run(port=8000)

