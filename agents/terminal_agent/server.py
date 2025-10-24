import litserve as ls
import subprocess
import os
from typing import Optional

class TerminalAgentAPI(ls.LitAPI):
    def setup(self, device):
        self.llm_available = False
        self.llm = None
        self.max_output_length = 5000
        self.agent_name = "Terminal Agent"

        # Try to initialize LLM with timeout protection
        try:
            openai_key = os.environ.get("OPENAI_API_KEY")
            if openai_key and openai_key != "NOT_SET":
                from litai import LLM
                self.llm = LLM(model="gpt-4", max_retries=1)
                self.llm_available = True
                print(f"{self.agent_name} initialized with AI analysis")
        except Exception as e:
            print(f"AI initialization failed: {e}")

        if not self.llm_available:
            print(f"{self.agent_name} initialized in basic mode (no AI analysis)")

    def decode_request(self, request):
        return request["command"]

    def predict(self, command):
        # Execute the command
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30,
                cwd=os.path.expanduser("~/valifi")
            )
            stdout = result.stdout[:self.max_output_length]
            stderr = result.stderr[:self.max_output_length]

            # Generate analysis
            analysis = self._generate_analysis(command, stdout, stderr, result.returncode)

            return {
                "stdout": stdout,
                "stderr": stderr,
                "returncode": result.returncode,
                "analysis": analysis,
                "agent": self.agent_name
            }
        except subprocess.TimeoutExpired:
            return {
                "stdout": "",
                "stderr": "Command timed out",
                "returncode": -1,
                "analysis": "Command execution exceeded 30 second timeout",
                "agent": self.agent_name
            }
        except Exception as e:
            return {
                "stdout": "",
                "stderr": str(e),
                "returncode": -1,
                "analysis": f"Command failed: {str(e)}",
                "agent": self.agent_name
            }

    def _generate_analysis(self, command: str, stdout: str, stderr: str, returncode: int) -> str:
        """Generate command analysis (with AI if available, otherwise basic)"""
        if self.llm_available and self.llm:
            try:
                analysis_prompt = f"""Analyze this terminal command and its output concisely:

Command: {command}
Output: {stdout[:500]}
Errors: {stderr[:500]}
Return Code: {returncode}

Provide a brief explanation (2-3 sentences)."""

                return self.llm.chat(analysis_prompt)
            except Exception as e:
                print(f"AI analysis failed: {e}")
                return self._basic_analysis(command, stdout, stderr, returncode)
        else:
            return self._basic_analysis(command, stdout, stderr, returncode)

    def _basic_analysis(self, command: str, stdout: str, stderr: str, returncode: int) -> str:
        """Generate basic analysis without AI"""
        if returncode == 0:
            return f"Command '{command}' executed successfully. Output: {len(stdout)} bytes, Errors: {len(stderr)} bytes"
        else:
            return f"Command '{command}' failed with exit code {returncode}. Check stderr for details."
    
    def encode_response(self, output):
        return output

if __name__ == "__main__":
    api = TerminalAgentAPI()
    server = ls.LitServer(api, accelerator="cpu")
    server.run(port=8001, log_level="info")