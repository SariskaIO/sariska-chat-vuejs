<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <div>token is {{socket}}</div>
</template>

<script>
import { onBeforeUnmount, ref, watchEffect } from 'vue';
import {Socket} from 'phoenix';
import {WEB_SOCKET_URL} from './constants';
import {getToken} from './utils';

export default {
  name: 'App',
  components: {
  },
  setup(){
    const socket = ref(null);

    const setSocket= (val) => { 
        socket.value = val
    }
    
    const fetchData = async() =>{
            console.log('socket before', socket.value);
            const token = await getToken();
            console.log('token after',token);
            const params = {token};
            const s = new Socket(WEB_SOCKET_URL, {params});
            s.onOpen( () => console.log("connection open!") )
            s.onError( () => console.log("there was an error with the   connection!") )
            s.onClose( () => console.log("the connection dropped") )
            s.connect();
            console.log('socket will', s);
            setSocket(s);
        }
          watchEffect(()=>{
            fetchData();
          })

    console.log('socket value', socket)
    onBeforeUnmount(()=>{
        socket.value && socket.value.disconnect();
    })
    
    return {
      socket
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
