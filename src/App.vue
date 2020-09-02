<template>
  <div id="app">
    <div v-show="this.logged" > 
      <div><img src="./assets/logged.png" ></div>
      <div><label>Logged :)</label></div>
    </div>
    <div  v-show="!this.logged" > 
      <div><img src="./assets/not_logged.png"></div>
      <div><label>Not Logged :(</label></div>
    </div>
  </div>
</template>

<script>

import {
  AuthorizationServiceConfiguration,
  FetchRequestor,
  RedirectRequestHandler,
  AuthorizationRequest,
  BaseTokenRequestHandler,
  TokenRequest,
  GRANT_TYPE_AUTHORIZATION_CODE,
  
} from "@openid/appauth";

//import { create } from 'pkce';

export default {
  name: 'App',
  data () {
      return {
        config: {},
        code: '',
        security: {},
        responseType: 'START',
        baseurl: "http://amer-identity.pfizer.com/c2a48310-971f-3204-8e9f-000000000000/login",
        clientId: "dab4b62c-94cb-407a-a255-af72ed694fc6",
        redirect: "http://localhost:3333/",
        logged: false
      }
  },
  created(){
    this.getWellKnowUrl();
  },
  methods: {
    getWellKnowUrl(){
      const fetchRequestor = new FetchRequestor();
      AuthorizationServiceConfiguration.fetchFromIssuer(this.baseurl, fetchRequestor)
        .then(response => {
          console.log('Fetched service configuration', response);
          this.config = response; 

          this.setStatus();
          this.init()
        })
        .catch(error => {
          console.log('Something bad happened', error);
        });
    },
    async setStatus(){

      let code = this.getUrlParam('code');
      if(code){
        this.responseType = 'CODE';
        this.code = code;
        this.security =  this.getSecurityObject();
        
        return;
      }

      let error = this.getUrlParam('error');
      if(error){
        this.responseType = 'ERROR';
      }

    },
    init(){
      if(this.responseType === 'START'){
        this.callSilentLogin();
      } else if(this.responseType === 'CODE'){
        this.callAuthenticator();
      } else{
        // handle error
      }
    },
    callSilentLogin(){
      const authorizationHandler = new RedirectRequestHandler();
      

      let request = new AuthorizationRequest({
        client_id: this.clientId,
        redirect_uri: this.redirect,
        scope: "openid",
        response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
        extras: {
          'prompt': 'none',
        }
      }); 
      
      authorizationHandler.performAuthorizationRequest(this.config, request);
    },
    callAuthenticator(){
      
      const requester = new BaseTokenRequestHandler(new FetchRequestor());
      let request = new TokenRequest({
        client_id: this.clientId,
        redirect_uri: this.redirect,
        grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
        code: this.code,
        refresh_token: undefined,
        extras: {
          code_verifier: this.security.internal.code_verifier,
          state:  this.security.state,
        },
      });

      requester.performTokenRequest(this.config, request)
        .then( (response) => {
          this.logged =true;
          console.log(response);
        })
        .catch((error) => {
          this.logged =false;
          console.log(error);
        });

    },
    getUrlParam(paramName) {
      const queryString = window.location.search;
      const result = new URLSearchParams(queryString).get(paramName);

      return result;
    },
    getSecurityObject(){
      const requestNumber = localStorage.getItem('appauth_current_authorization_request');
      const request = `${requestNumber}_appauth_authorization_request`;
      const response = JSON.parse(localStorage.getItem(request));
      
      return  response;
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
