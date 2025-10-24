import litserve as ls
import json
import os
from typing import Optional

class SDKAgentAPI(ls.LitAPI):
    def setup(self, device):
        self.agent_name = "SDK Agent"
        self.llm_available = False
        self.llm = None

        # Try to initialize AI capabilities
        try:
            # Check for available API keys
            anthropic_key = os.environ.get("ANTHROPIC_API_KEY")
            openai_key = os.environ.get("OPENAI_API_KEY")
            google_key = os.environ.get("GOOGLE_GEMINI_API_KEY")

            # Try to import and initialize LLM
            if anthropic_key and anthropic_key != "NOT_SET":
                try:
                    from litai import LLM
                    self.llm = LLM(model="claude-3-sonnet", max_retries=2)
                    self.llm_available = True
                    print(f"{self.agent_name} initialized with Claude AI")
                except Exception as e:
                    print(f"Failed to initialize Claude: {e}")

            elif openai_key and openai_key != "NOT_SET":
                try:
                    from litai import LLM
                    self.llm = LLM(model="gpt-4o", max_retries=2)
                    self.llm_available = True
                    print(f"{self.agent_name} initialized with OpenAI")
                except Exception as e:
                    print(f"Failed to initialize OpenAI: {e}")

            elif google_key and google_key != "NOT_SET":
                try:
                    from litai import LLM
                    self.llm = LLM(model="gemini-pro", max_retries=2)
                    self.llm_available = True
                    print(f"{self.agent_name} initialized with Gemini")
                except Exception as e:
                    print(f"Failed to initialize Gemini: {e}")

        except Exception as e:
            print(f"LLM initialization error: {e}")

        if not self.llm_available:
            print(f"{self.agent_name} initialized in basic mode (no AI model configured)")
            print("To enable AI features, set one of: ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_GEMINI_API_KEY")

    def decode_request(self, request):
        return request

    def predict(self, request):
        query = request.get("query", "")
        context = request.get("context", {})
        use_ai = request.get("use_ai", True)  # Allow disabling AI per request

        # Build response
        if self.llm_available and use_ai and query:
            try:
                # Use AI to generate intelligent response
                prompt = self._build_prompt(query, context)
                ai_response = self.llm.chat(prompt)

                return {
                    "response": ai_response,
                    "status": "success",
                    "agent": self.agent_name,
                    "mode": "ai-powered",
                    "query": query
                }
            except Exception as e:
                # Fallback to basic mode on error
                print(f"AI processing error: {e}")
                return self._basic_response(query, context, error=str(e))
        else:
            # Basic mode response
            return self._basic_response(query, context)

    def _build_prompt(self, query: str, context: dict) -> str:
        """Build an effective prompt for the LLM"""
        prompt_parts = []

        if context:
            prompt_parts.append("Context Information:")
            for key, value in context.items():
                prompt_parts.append(f"- {key}: {value}")
            prompt_parts.append("")

        prompt_parts.append(f"User Query: {query}")
        prompt_parts.append("")
        prompt_parts.append("Please provide a helpful, accurate, and concise response.")

        return "\n".join(prompt_parts)

    def _basic_response(self, query: str, context: dict, error: Optional[str] = None) -> dict:
        """Generate basic response when AI is not available"""
        response_parts = [f"Query received: '{query}'"]

        if context:
            response_parts.append(f"Context: {json.dumps(context, indent=2)}")

        if error:
            response_parts.append(f"Note: AI processing unavailable ({error})")

        return {
            "response": "\n".join(response_parts),
            "status": "success",
            "agent": self.agent_name,
            "mode": "basic" if not error else "fallback",
            "ai_available": self.llm_available
        }

    def encode_response(self, output):
        return output

if __name__ == "__main__":
    api = SDKAgentAPI()
    server = ls.LitServer(api, accelerator="auto")
    server.run(port=8002)