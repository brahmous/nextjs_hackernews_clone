import SessionStorage from "./sessions";

interface CachContrller {
	session_storage: SessionStorage;
};

const cache_controller: CachContrller = {
	session_storage: new SessionStorage()
};

export default function() {
	return cache_controller;
}
