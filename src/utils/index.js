import {GENERATE_TOKEN_URL} from "../constants";

export const getToken = async (userId)=> {
    const body = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            apiKey: "249202aabed00b41363794b526eee6927bd35cbc9bac36cd3edcaa", // enter your app secret
            user: {  
                 id: userId
            }
        })
    };
    try {
        const response = await fetch(GENERATE_TOKEN_URL, body);
        if (response.ok) {
            const json = await response.json();
            return json.token;
        } else {
            console.log(response.status);
        }
    } catch (error) {
        console.log('error', error);
    }
}