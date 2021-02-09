import {GENERATE_TOKEN_URL} from "../constants";

export const getToken = async ()=> {
    const body = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            apiKey: "24fd6f92d6d017492e3e98e334ebafc76dd350bb93a0729d38", // enter your app secret
            // user: {  
            //      id: "101",
            //      name: "gurudeep",
            //      //Optionally, you can provide user display information for better tracking and user experience
            //     //  avatar: <user_avatar>, 
            //     //  email: <user_email>
            //  }
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