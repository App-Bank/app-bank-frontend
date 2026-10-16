const API_URL = "http://127.0.0.1:8000/api";

export const api = {
    // Log-in Logic
    // TODO: match current router URL in backend repo
    // NOTE: Backend's `user` expects the following:
        // {
        //   "email": "STRING",
        //   "password": "STRING"
        // }
    // NOTE: its call should be the following:
        // const loginResult = await api.login({
        //     email,
        //     password
        // }) 
    async login(credentials) {
        const response = await axios.post(
            `${API_URL}/login`,
            credentials
        );

        return response.data;
    },
    
    // Transfer Creation Logic
    // TODO: find a way to determine user's timezone when creating a transfer, otherwise keep a default or remove `timezone` altogether
    // NOTE: `transfer`'s form expects the following:
        // {
        //   "amount": INTEGER,
        //   "concept": "STRING",
        //   "recipient_account_id": INTEGER,
        //   "timezone_id": INTEGER
        // }
    // NOTE: its call should be the following:
        // const transferResult = await api.createTransfer({
        //     recipientId,
        //     amount,
        //     concept
        // });
    async createTransfer(transferData) {
        const response = await axios.post(
            `${API_URL}/transfers`,
            transferData
        );

        return response.data;
    },

    // Activity History Fetch Logic
    // NOTE: because the project lacks an auth process, `{params: { userId }}` is used instead
    // NOTE: because filter's logic has been implemented via JS, Axios calls for the **whole** JSON list from the backend, which then the frontend filters the given data
    // NOTE: its call should be the following:
        // const activityResult = await api.getActivities(user.id);
    async getActivities(userId) {
        const response = await axios.get(
            `${API_URL}/activities`,
            {params: { userId }}
        );

        return response.data;
    },
};