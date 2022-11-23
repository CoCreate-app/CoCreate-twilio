'use strict'
var api = require('@cocreate/api');
const VoiceResponse = require('twilio').twiml.VoiceResponse;

let collection_name = "testtwillio";

class CoCreateTwilio {
	constructor(wsManager) {
		this.name = 'twilio';
		this.wsManager = wsManager;
		this.environment = 'test'; //'test' or 'prod' 
		this.init();
	}
	init() {
		if (this.wsManager) {
			this.wsManager.on(this.name,		(socket, data) => this.sendTwilio(socket, data));
		}
	}
	async sendTwilio(socket, data) {
		let data_original = {...data["data"]};
		let that = this;
		let send_response ='twilio';
		let type = data['type'];
		const twiml = new VoiceResponse();
		const params = data['data'];
		let url_twilio = data_original.data.url ? data_original.data.url : 'https://server.cocreate.app:8088/api_/twilio/actions_twiml';		 
		let org = 0; 
		let client;
		try{
		   let org_data = await api.getOrg(params,this.name);
		   let environment = typeof params['environment'] != 'undefined' ? params['environment'] : this.environment;
			const accountId =org_data['apis.twilio.'+environment+'.twilioAccountId'];//org_data["apis"]["twilio"]["twilioAccountId"];
    		const authToken = org_data['apis.twilio.'+environment+'.twilioAuthToken'];
			client = require('twilio')(accountId, authToken);
		  }catch(e){
			org = 0;
			console.log("Error connect twilio",e)
		  }  
		switch (type) {
			case 'callRecordingCreate':
				client.calls(data_original.data.CallSid)
				  .recordings
				  .create()
				  .then(recording => {
					api.send_response(that.wsManager, socket, {"type":type,"response":recording}, send_response);
				  });
				  
			break;
			case 'callRecordingPause':
				client.calls(data_original.data.CallSid)
				  .recordings('Twilio.CURRENT')
				  .update({status: 'paused'})
				  .then(recording => {
					api.send_response(that.wsManager, socket, {"type":type,"response":recording}, send_response);
				  });
			break;
			case 'callRecordingResume':
				client.calls(data_original.data.CallSid)
				  .recordings('Twilio.CURRENT')
				  .update({status: 'in-progress'})
				  .then(recording => {
					api.send_response(that.wsManager, socket, {"type":type,"response":recording}, send_response);
				  });
			break;
			case 'callRecordingList':
				client.recordings
			  .list({callSid: data_original.data.CallSid, limit: 20})
			  .then(recordings => {
				let response_recordings = [];
				recordings.forEach(r => {
					r['url_public'] = 'https://api.twilio.com/2010-04-01/Accounts/'+config.accountSid+'/Recordings/'+r.sid+'.mp3';
					response_recordings.push(r);
				});
				api.send_response(that.wsManager, socket, {"type":type,"response":response_recordings}, send_response)
			  });
			break;
			case 'dialTransfer':
				try{
					data_original["transfer_call"] = false;
					let CallSid = data_original.data.CallSid;
					if (!CallSid){
						throw "NoExisteCallSid";
					}
					if (CallSid != undefined){
						client.calls(CallSid)
						.fetch()
						.then(async call => {
							await client.calls(call.parentCallSid).update({
								twiml : '<Response>\
										  <Dial><Client>frankie</Client></Dial>\
										</Response>'
							});
							api.send_response(that.wsManager, socket, {"type":type,"response":data_original}, send_response)
						});
					}
				}catch(e){
					//create conference
					data_original["transfer_call"] = true;
					api.send_response(that.wsManager, socket, {"type":type,"response":data_original}, send_response);
					that.wsManager.onMessage(socket, 'createDocument', data /* it will be request data */);
				}
			break;
			case 'dialEnqueue':
				let waitUrl = data_original.data.waitUrl ? data_original.data.waitUrl : url_twilio +'?opt=holdmusic' ; 
				let CallSid = data_original.data.CallSid;
				let nameEnqueue = data_original.data.nameEnqueue;
				if (CallSid != undefined){
				twiml.enqueue({
						waitUrl: waitUrl,
						waitUrlMethod : 'GET'
					  }, nameEnqueue);
					client.calls(CallSid)
					.fetch()
					.then(call => {
						let response = twiml.dial();
						response.conference(call.from);
					  client.calls(call.parentCallSid).update({
						  twiml : response.toString()
						})
					  api.send_response(that.wsManager, socket, {"type":type,"response":data_original}, send_response)
					});
				}
			break;
			case 'getListQueues':
				client.queues.list({limit: 20})
				.then(queues => {
					let resultado = [];
					queues.forEach(q => { 
						resultado.push({'idqueue':q.sid,'friendlyName':q.friendlyName})
					})
					api.send_response(that.wsManager, socket, {"type":type,"response":resultado}, send_response);
				});
			break;
			case 'deleteQueue':
				let idqueue = data_original.data.idqueue;
				client.queues(idqueue).remove();
				api.send_response(that.wsManager, socket, {"type":type,"response":data_original.data}, send_response);
			break;
			case 'dialConference':
				try{
					data_original["create_conference"] = false;
					let CallSid = data_original.data.CallSid
					if (!CallSid){
						throw "NoExisteCallSid";
					}
					if (CallSid != undefined){
						client.calls(CallSid)
						.fetch()
						.then(async call => {
							let response = twiml.dial();
							let waitUrl = data_original.data.holdUrl ? data_original.data.holdUrl : url_twilio +'?opt=holdmusic' ; 
							const url_twilio_root = 'https://server.cocreate.app:8088/api_/twilio';
							response.conference({
									waitUrl: waitUrl,
									waitMethod : 'GET',
									statusCallbackEvent : 'start end join leave mute hold speaker',
									statusCallback : url_twilio_root+'/calls_events_conference',
									statusCallbackMethod : 'POST'
								}, data_original.data.friendlyName);
							await client.calls(call.parentCallSid).update({
								twiml : response.toString()
							});
							api.send_response(that.wsManager, socket, {"type":type,"response":data_original}, send_response)
						});
					}
				}catch(e){
					data_original["create_conference"] = true;
					api.send_response(that.wsManager, socket, {"type":type,"response":data_original}, send_response);
				}
			break;
			case 'unholdConference':
				client.conferences(data_original.data.CallSid)
				  .participants
				  .list({limit: 20})
				  .then(participants =>	
						participants.forEach(p => {
							client.conferences(data_original.data.CallSid)
							.participants(p.callSid)
							.update({hold: false})
							.then(participant => {
									//console.log(participant.callSid)
									});
							})
				  );
			break;
			case 'holdConference':
				client.conferences(data_original.data.CallSid)
				  .participants
				  .list({limit: 20})
				  .then(participants =>
						participants.forEach(p => {		
						client.conferences(data_original.data.CallSid)
						.participants(p.callSid)
						.update({hold: true, holdUrl: url_twilio+'?opt=holdmusic'})
						.then(participant => {
							//console.log(participant.callSid
							});
						})
				  );
			break;
			case 'endConference':
				client.conferences(data_original.data.CallSid)
				  .update({status: 'completed'})
				  .then(conference => {//console.log("Finish -> ",conference.friendlyName)
				  });
			break;
			case 'getConferences':
				client.conferences.list(
					  {
					  status: 'in-progress',
					  limit: 20})
					.then(conferences => {
					  let resultado = []
					  let participantes =  [];
					  conferences.forEach(c => {
						resultado.push({'idconference':c.sid,'friendlyName':c.friendlyName})
					  })
					  api.send_response(that.wsManager, socket, {"type":type,"response":resultado}, send_response);	
					})
			break;
			case 'delParticipantsConference':
				client.conferences(data_original.data.idconference)
			  .participants(data_original.data.idparticipant)
			  .remove();
			break;
			case 'holdParticipantConference':
				client.conferences(data_original.data.idconference)
				  .participants(data_original.data.idparticipant)
				  .update({hold: true, holdUrl: url_twilio+'?opt=holdmusic'})
				  .then(participant => {
					api.send_response(that.wsManager, socket, {"type":type,"response":participant.callSid}, send_response);
					//console.log(participant.callSid);
				  });
			break;
			case 'unholdParticipantConference':
				client.conferences(data_original.data.idconference)
				  .participants(data_original.data.idparticipant)
				  .update({hold: false})
				  .then(participant =>{ 
					api.send_response(that.wsManager, socket, {"type":type,"response":participant.callSid}, send_response);
				  });
			break;
			case 'muteParticipantsConference':
				client.conferences(data_original.data.idconference)
				.participants(data_original.data.idparticipant)
				.update({muted: true})
				.then(participant => {
					api.send_response(that.wsManager, socket, {"type":type,"response":participant.callSid}, send_response);
				});
			break;
			case 'unmuteParticipantsConference':
				client.conferences(data_original.data.idconference)
				.participants(data_original.data.idparticipant)
				.update({muted: false})
				.then(participant => {
					api.send_response(that.wsManager, socket, {"type":type,"response":participant.callSid}, send_response);
				});
			break;
			case 'getParticipantsConference':
				client.conferences(data_original.data.CallSid)
				  .participants
				  .list({limit: 20})
				  .then(async participants => {
						let response = []
						for(let participant of participants) {
							const call = await client.calls(participant.callSid)
							.fetch()
							.then(call => {return call;});
							participant["call"]  = call;
							response.push(participant);
						}
						let data = {'idconference':data_original.data.CallSid,'participants':response};
						api.send_response(that.wsManager, socket, {"type":type,"response":data}, send_response);	
					});
			break;
			case 'response':
				try{
					let result = this.runResonse(twiml, data.data);
					api.send_response(that.wsManager, socket, {"type":type,"response":result}, send_response)
					
				}catch(e){
					
					console.log(e);
					api.send_response(that.wsManager, socket, {"type":type,"response":data_original}, send_response);
				}
			break;
			case 'dial':
				try{
					data_original["create_conference"] = false;
						let CallSid = data_original.data.CallSid
						if (!CallSid){
							throw "NoExisteCallSid";
						}
						if (CallSid != undefined){
							client.calls(CallSid)
							.fetch()
							.then(async call => {
								let result = this.runResonse(twiml, data.data);
								await client.calls(call.parentCallSid).update({
									twiml : result
								});
								api.send_response(that.wsManager, socket, {"type":type,"response":data_original}, send_response)
							});
						}
				}catch(e){
					console.log(e);
					data_original["create_conference"] = true;
					api.send_response(that.wsManager, socket, {"type":type,"response":data_original}, send_response);			
				}
			break;
		}
	}// end sendTwilio
	
	runResonse(response, data) {
		if (typeof data !== 'object' || data == null) return null;
		let nouns = Object.keys(data).filter(x => x !== '__param' && x !== '__props');
		let latestResult = "";
		const self = this;
		nouns.forEach(noun => {
			let nounDataList  = [];
			if (Array.isArray(data[noun])) {
				nounDataList = data[noun];
			} else {
				nounDataList.push(data[noun]);
			}
			for (const requestData of nounDataList ) {
				if (!requestData.__props) continue;
				
				let result;
				if (!requestData.__param) {
					result = response[noun](requestData.__props);
				} else {
					result = response[noun](requestData.__props, requestData.__param);
				}
				latestResult = result.toString();
				if (result) {
					let deep_result = self.runResonse(result, requestData);
					
					if (deep_result) {
						latestResult = deep_result;
					}
				}				
			}
		})
		return latestResult;
	} //. end runresponse function
}//end Class 
module.exports = CoCreateTwilio;