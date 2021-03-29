import api from '@cocreate/api/src'
import {socket, crud} from '../../../CoCreateJS/src';
// import * as loadTwilio from 'twilio-client-mirror';
import { Device } from 'twilio-client'; 
// import Twilio from 'twilio-client';
// const Device = require('twilio-client').Device;
// hello

let URL_TWILIO = "https://server.cocreate.app:8088/api_/twilio";
const device = new Device();
// const device = new Twilio.Device();
let myConnection = '';
let debug_twilio = false;
let myStorage = window.localStorage;

let user = myStorage.getItem('user_id') ? myStorage.getItem('user_id') : '5ff49ec8421c2c14653a1a39';

if(document.querySelector('[data-twilio="setUserNameLocalStorage.user_id"]'))
	document.querySelector('[data-twilio="setUserNameLocalStorage.user_id"]').value=user;

fetch(URL_TWILIO+'/token/'+user, {
	        'mode': 'cors',
	        'headers': {
            	'Access-Control-Allow-Origin': '*',
        	}
    	})
 .then(response => response.json())
 .then(data => {
    let token = data.token;

    device.setup(token, { 
        enableRingingState: true,
        debug: debug_twilio
    });
        
    device.on('ready',(conn)=>{
      console.log("REady ")
    })
    
    device.on('offline',(conn)=>{
      console.log("Offline ")
    })
    
    device.on('busy',(conn)=>{
      console.log("busy ")
    })
    
    //Events
    device.on('cancel', (connection)=>{
      //This is triggered when an incoming connection is canceled by the caller before it is accepted by the Twilio Client device.
      console.log("Cancel Call incomming")
    });
    
    device.on('connect', (conn)=>{
      //This is triggered when a connection is opened, whether initiated using .connect()
      console.log(" Connect  call Front")
      myConnection = conn;
      let  CallSid = myConnection.parameters.CallSid;
      // //document.querySelector("[data-twilio='holdCall.CallSid']").value=CallSid;
      console.log(" Sendind Render to -> createCall",{render2: myConnection})
      api.render(`[data-template_id=createCall]`, {render2: myConnection});
    })
    
    device.on('disconnect', (connection)=>{
      //Fired any time a Connection is closed
      console.log("Disconnect Call")
      /*Hide Btns*/
    })
    
    device.on('error', (error)=>{
      console.log("Errorr ",error)
      //Emitted when any device error occurs.
    })
    
    device.on('ringing', conn => {
      console.log("rinngin")
    });
    
    device.on('outgoing', conn => {
//      let  CallSid = conn.parameters.CallSid
      console.log(" Outgoin conn ",conn)
    });
    device.on('incoming', conn => {
        myConnection = conn
        document.querySelector("[data-actions='answerCall']").style.display = 'initial'
        document.querySelector("[data-id='dialConference']").style.display = 'initial'
        let  CallSid = myConnection.parameters.CallSid
        console.log('incomming => ',CallSid,{render2: myConnection})  
        //render in form
        api.render( 'createCall', {render2: myConnection});
    });
      //end FTECH
 })
  .catch(function(error) {
    console.log('ERROR Fetch [token]:' + error.message);
});//end FTECH URL TWILIO BACKEND NODE


const CoCreateTwilio = {
	id: 'twilio',
	actions: [
	  'deleteQueue',
	  'getListQueues',
	  'dialEnqueue',
	  'dialQueue',
	  'dialTransfer',
	  'setUserNameLocalStorage',
	  'callRecordingCreate',
	  'callRecordingPause',
	  'callRecordingResume',
	  'callRecordingList',
	  'holdParticipantConference',
	  'unholdParticipantConference',
	  'muteParticipantsConference',
	  'unmuteParticipantsConference',
	  'delParticipantsConference',
	  'getParticipantsConference',
	  'holdConference',
	  'unholdConference',
	  'joinConference',
	  'endConference',
		'createCall',
		'hangupCall',
		'dialConference',
		'answerCall',
		'getConferences',
		'createConference',
		
		'twilioListSubAccounts',
		'twilioPurchasePhoneNumber',
		'twiliofetchAvailbleNumbers',
		'twilioCreateSubAccount',
		'twilioDeleteSubAccount',
		'twilioGetUsage',
		'twilioPhoneNumberList',
		'twilioGetIncommingPhoneNumbers',
		'twilioGetBillingUsages',
		'twilioDeletePhoneNumber',
		'updateIncomingPhoneNumber',
		'response'
	],
	
	
	render_callRecordingList: function(data) {
       if (data.object == "error") {
            alert(data.data)
        }
       data = {data: data};
       console.log("data ",data)
      api.render('callRecordingList', data);
	},
	render_holdParticipantConference: function(data) {
	  let id_participante = data;
	  let action = 'holdParticipantConference';
	  let btn_holdParticipante = document.querySelector('[data-actions="'+action+'"][data-idparticipant="'+id_participante+'"]')
	  btn_holdParticipante.style.display = 'none';
	  let btn_unholdParticipante = document.querySelector('[data-actions="un'+action+'"][data-idparticipant="'+id_participante+'"]')
	  btn_unholdParticipante.style.display = 'initial';

	},
	render_unholdParticipantConference: function(data) {
	  let id_participante = data;
	  let action = 'holdParticipantConference';
	  let btn_holdParticipante = document.querySelector('[data-actions="'+action+'"][data-idparticipant="'+id_participante+'"]')
	  btn_holdParticipante.style.display = 'initial';
	  let btn_unholdParticipante = document.querySelector('[data-actions="un'+action+'"][data-idparticipant="'+id_participante+'"]')
	  btn_unholdParticipante.style.display = 'none';
	},
	
	render_muteParticipantsConference: function(data) {
	  let id_participante = data;
	  let btn_mute = document.querySelector('[data-actions="muteParticipantsConference"][data-idparticipant="'+id_participante+'"]')
	  btn_mute.style.display = 'none';
	  let btn_unmute = document.querySelector('[data-actions="unmuteParticipantsConference"][data-idparticipant="'+id_participante+'"]')
	  btn_unmute.style.display = 'initial';

	},
	render_unmuteParticipantsConference: function(data) {
	  let id_participante = data;
	  let btn_mute = document.querySelector('[data-actions="muteParticipantsConference"][data-idparticipant="'+id_participante+'"]')
	  btn_mute.style.display = 'initial';
	  let btn_unmute = document.querySelector('[data-actions="unmuteParticipantsConference"][data-idparticipant="'+id_participante+'"]')
	  btn_unmute.style.display = 'none';
	},
	
	render_getParticipantsConference: function(data) {
	  console.log(data)
	  let id_conference = data.idconference;
	  data = {participant: data.participants};
	  api.render('getParticipantsConferences_'+id_conference, data);
	},
	action_hangupCall: function(data) {
			console.log(" hangupCall ")
  		device.disconnectAll();
           if (myConnection)
                myConnection.reject();
	},

	
	render_dialConference: async function(data) {
		console.log("Dial",data)
		if(data.create_conference){
			//createConference
			let friendlyName = data.data.friendlyName ? data.data.friendlyName : 'CocreateConference'
			myConnection = device.connect({'opt':'joinConference','friendlyname':friendlyName});
		      let  CallSid = myConnection.parameters.CallSid;
		      console.log("CallSid, createConference ",CallSid)
		}
			await new Promise(r => setTimeout(r, 2000));
	  //dispatch('action_getConferences')
	},
	render_getConferences: function(data) {
       if (data.object == "error") {
            alert(data.data)
        }
       data = {data: data};
      api.render('getConferences', data);
	},
	
	action_joinConference: function(element, data) {
	  console.log('data',data)
	  console.log(element.dataset)
	  myConnection = device.connect({'opt':'joinConference','friendlyname':element.dataset['friendlyname']});
    let  CallSid = myConnection.parameters.CallSid;
	},
	
	action_createCall: function(element, data) {
		var data = api.getFormData('twilio', 'dial', document)
		console.log("createCall ",data)
    	myConnection = device.connect(data);
    	let  CallSid = myConnection.parameters.CallSid;
    	console.log("createCall ",myConnection)
    	api.render(this.id, 'createCall', {render2: myConnection});
	},
	
	action_answerCall: function(element, data) {
      myConnection.accept();
	},
	
	action_dialQueue: async function(element, data) {
	  //alert('unhold')
	  //myConnection = device.connect({'unhold':true,'queue':'support'});
	  /*var data = api.getFormData('twilio', 'dialQueue', element)
	  console.log("dialQueue",data)
	  */
	  console.log("dialQueue ",element.dataset['friendlyname'])
	  myConnection = device.connect({'opt':'queue','friendlyname':element.dataset['friendlyname']});
	  await new Promise(r => setTimeout(r, 2000));
	},
	render_getListQueues: function(data) {
		if (data.object == "error") {
            alert(data.data)
        }
       data = {data: data};
       console.log("DAta ",data)
      api.render('getListQueues', data);	
	},
	
	action_unholdCall: function(element, data) {
	  var data = api.getFormData('twilio', 'holdCall', document)
	  data["unhold"]=true;
	  console.log(" DAta unhold ",data)
	  myConnection = device.connect(data);
	},
	action_setUserNameLocalStorage: function(element, data) {
		var data = api.getFormData('twilio', 'setUserNameLocalStorage', document)
		myStorage.setItem('user_id',data['user_id']);
	},

	/*new features*/
	
	render_twilioListSubAccounts: function(data) {
        if (data.object == "error") {
            alert(data.data)
        }
        console.log(data);
        // api.render('randermsg', data);
    },
	
	render_twilioCreateSubAccount: function(data) {
        if (data.object == "error") {
            alert(data.data)
        }
        console.log(data);
	},
	
	render_twilioDeleteSubAccount: function(data) {
        if (data.object == "error") {
            alert(data.data)
        }
        console.log(data);
	},
	
	render_twilioPurchasePhoneNumber: function(data) {
        if (data.object == "error") {
            alert(data.data)
        }
        console.log(data);
	},
	
	render_twilioGetIncommingPhoneNumbers : function(data) {
        if (data.object == "error") {
            alert(data.data)
        }
        console.log(data);
	},
	
	render_twiliofetchAvailbleNumbers: function(data) {
        if (data.object == "error") {
            alert(data.data)
        }
        console.log(data);
	},
	
	render_twilioGetUsage: function(data) {
        if (data.object == "error") {
            alert(data.data)
        }
        console.log(data);
        console.table(data.data)
	},
	
	render_twilioPhoneNumberList: function(data) {
        if (data.object == "error") {
            alert(data.data)
        }
        console.log(data);
	},
	
	render_twilioGetBillingUsages: function(data) {
        if (data.object == "error") {
            alert(data.data)
        }
        console.log(data);
	},
	
	render_response: function(data) {
		console.log(data);
	}
	
	// 	action_twilioListSubAccounts: function(element, data) {
	// 		//. data rendering by cocreate-render
	// 		console.log('rander',data)
	// 	    api.render(this.id, 'xxxCreateCard', {render2: data});
	
	// 	}

// END CreacteCard endpoint	



}

api.init({
	name: CoCreateTwilio.id, 
	module:	CoCreateTwilio,
});

export default CoCreateTwilio;