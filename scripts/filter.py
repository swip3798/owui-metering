"""
title: Openrouter-Metering
author: swip3798
author_url: https://github.com/open-webui
funding_url: https://github.com/open-webui
requirements: httpx
version: 0.1
"""

from pydantic import BaseModel, Field
from typing import Optional
import logging
from httpx import AsyncClient
import json

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class Filter:
    class Valves(BaseModel):
        metering_api_url: str = Field(
            default="", description="The API the metering info should be send to."
        )
        metering_api_key: str = Field(
            default="", description="The API key set for the metering collector."
        )
        pass

    def __init__(self):
        # Indicates custom file handling logic. This flag helps disengage default routines in favor of custom
        # implementations, informing the WebUI to defer file-related operations to designated methods within this class.
        # Alternatively, you can remove the files directly from the body in from the inlet hook
        # self.file_handler = True

        # Initialize 'valves' with specific configurations. Using 'Valves' instance helps encapsulate settings,
        # which ensures settings are managed cohesively and not confused with operational flags like 'file_handler'.
        self.valves = self.Valves()
        self.type = "filter"
        pass

    async def request(
        self, client: AsyncClient, url: str, headers: dict, json_data: dict
    ):
        json_data = json.loads(
            json.dumps(
                json_data, default=lambda o: o.dict() if hasattr(o, "dict") else str(o)
            )
        )

        response = await client.post(url=url, headers=headers, json=json_data)
        response.raise_for_status()
        response_data = response.json()
        if not response_data.get("success"):
            logger.error(self.get_text("request_failed", error_msg=response_data))
            raise CustomException(
                self.get_text("request_failed", error_msg=response_data)
            )
        return response_data

    def inlet(self, body: dict, __user__: Optional[dict] = None) -> dict:
        # Modify the request body or validate it before processing by the chat completion API.
        # This function is the pre-processor for the API where various checks on the input can be performed.
        # It can also modify the request before sending it to the API.
        body["usage"] = {"include": True}
        return body

    async def outlet(
        self,
        body: dict,
        __user__: Optional[dict] = None,
        __event_emitter__: Optional[callable] = None,
    ) -> dict:
        # Modify or analyze the response body after processing by the API.
        # This function is the post-processor for the API, which can be used to modify the response
        # or perform additional checks and analytics.

        last_message = body["messages"][-1]
        client = AsyncClient()
        try:
            payload = {
                "user": {
                    "id": __user__["id"],
                    "name": __user__["name"],
                    "role": __user__["role"],
                    "email": __user__["email"],
                },
                "activity": {
                    "id": body["id"],
                    "timestamp": last_message["timestamp"],
                    "cost": last_message["usage"]["cost"],
                    "model": body["model"],
                    "user_id": __user__["id"],
                    "prompt_token": last_message["usage"]["prompt_tokens"],
                    "completion_token": last_message["usage"]["completion_tokens"],
                },
            }
            if __event_emitter__:
                await __event_emitter__(
                    {
                        "type": "status",
                        "data": {
                            "description": f"Token: {last_message['usage']['prompt_tokens']} -> {last_message['usage']['completion_tokens']} | Cost: {last_message['usage']['cost']:.7f}",
                            "done": True,
                        },
                    }
                )
            await self.request(
                client=client,
                url=f"{self.valves.metering_api_url}/api/v1/metering/record",
                headers={"Authorization": f"{self.valves.metering_api_key}"},
                json_data=payload,
            )

            return body
        except Exception as err:
            logger.exception(err, body)
            raise Exception(err)
        finally:
            await client.aclose()
