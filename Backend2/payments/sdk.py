import requests
from typing import Dict, List, Any


class CryptoCloudSDK:
	def __init__(self, api_key: str):
		"""
		Initializing SDK for CryptoCloud.

		:param api_key: API key for authorizing requests.
		"""
		self.api_key = api_key
		self.base_url = "https://api.cryptocloud.plus/v2/"

	def _send_request(self, endpoint: str, method: str = "POST", payload: Dict[str, Any] = None) -> Dict[str, Any]:
		"""
		Sending a request to CryptoCloud API.

		:param endpoint: API endpoint.
		:param method: HTTP method.
		:param payload: Request data.
		:return: Response from server in JSON format.
		"""
		headers = {"Authorization": f"Token {self.api_key}"}
		url = self.base_url + endpoint
		response = requests.request(method, url, headers=headers, json=payload)
		return response.json()

	def create_invoice(self, invoice_data: Dict[str, Any]) -> Dict[str, Any]:
		"""
		Creating an invoice.
		invoice_data =
		{
			"amount": float,\n
			"shop_id": str,\n
			"currency": str,\n
    		"order_id": str,\n
    		"add_fields":{
    			"time_to_pay": {
    				 "hours": int,\n
    				 "minutes": int\n
    				},
    			"email_to_send":str,
    			"available_currencies":List[str], \n
    			"period":str - month, week, day\n
    			"cryptocurrency": str \n
    			}
		}
		:param invoice_data: Data for creating an invoice.

		:return: Response from API about invoice creation.
		"""
		return self._send_request("invoice/create", payload=invoice_data)

	def cancel_invoice(self, uuid: str) -> Dict[str, Any]:
		"""
		Cancel invoice.

		:param uuid: Unique invoice identifier.
		:return: Response from API about invoice cancellation.
		"""
		data = {"uuid": uuid}
		return self._send_request("invoice/merchant/canceled", payload=data)

	def list_invoices(self, start_date: str, end_date: str, offset: int = 0, limit: int = 10) -> Dict[str, Any]:
		"""
		Getting a list of invoices.

		:param start_date: Period start date. dd.mm.yyyy
		:param end_date: Period end date. dd.mm.yyyy
		:param offset: Record list offset. 0
		:param limit: Number of entries in the list. 10
		:return: Response from API with list of invoices.
		"""
		data = {"start": start_date, "end": end_date, "offset": offset, "limit": limit}
		return self._send_request("invoice/merchant/list", payload=data)

	def get_invoice_info(self, uuids: List[str]) -> Dict[str, Any]:
		"""
		Obtaining information about invoices.

		:param uuids: List of unique invoice identifiers.
		:return: Response from the API with information about invoices.
		"""
		data = {"uuids": uuids}
		return self._send_request("invoice/merchant/info", payload=data)

	def get_balance(self) -> Dict[str, Any]:
		"""
		Obtaining information about your account balance.

		:return: Response from API with balance information.
		"""
		return self._send_request("merchant/wallet/balance/all")

	def get_statistics(self, start_date: str, end_date: str) -> Dict[str, Any]:
		"""
		Getting account statistics.

		:param start_date: Period start date.
		:param end_date: Period end date.
		:return: Response from API with account statistics.
		"""
		data = {"start": start_date, "end": end_date}
		return self._send_request("invoice/merchant/statistics", payload=data)
