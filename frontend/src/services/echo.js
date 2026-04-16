import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import api from './api';

window.Pusher = Pusher;

const appKey = import.meta.env.VITE_REVERB_APP_KEY;

let echo = null;

if (appKey) {
    echo = new Echo({
        broadcaster: 'reverb',
        key: appKey,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https' ? ['wss'] : ['ws'],
        authorizer: (channel) => {
            return {
                authorize: (socketId, callback) => {
                    api.post('/broadcasting/auth', {
                        socket_id: socketId,
                        channel_name: channel.name
                    })
                    .then(response => {
                        callback(false, response.data);
                    })
                    .catch(error => {
                        callback(true, error);
                    });
                }
            };
        },
    });
} else {
    console.warn("Pusher/Reverb key missing: Real-time notifications disabled.");
}

export default echo;
