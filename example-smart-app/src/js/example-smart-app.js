(function (window) {
    window.extractData = function () {
        var ret = $.Deferred();

        function onError() {
            console.log('Loading error', arguments);
            ret.reject();
        }

        function onReady(smart) {
            if (smart.hasOwnProperty('patient')) {
                var patient = smart.patient;
                var pt = patient.read();
                var obv = smart.patient.api.fetchAll({
                    type: 'Observation',
                    query: {
                        code: {
                            $or: ['http://loinc.org|8302-2', 'http://loinc.org|8462-4',
                                'http://loinc.org|8480-6', 'http://loinc.org|2085-9',
                                'http://loinc.org|2089-1', 'http://loinc.org|55284-4']
                        }
                    }
                });
                //var token = smart.server.auth.type + " " + smart.server.auth.token;
                var token = smart.tokenResponse.token_type + " " + smart.tokenResponse.access_token;
                var serverURL = smart.server.serviceUrl;
                console.log(serverURL);
                client = getFHIRClient(serverURL, token, "application/json", "application/json");
                console.log(client);
                var relativeURL = "Patient/" + patient.id;
                console.log("relativeURL="+relativeURL)
                var response = client.request(relativeURL);
                console.log("result=");
                console.log(response);
                fhirAPIs = ["Patient", "AllergyIntolerance", "MedicationRequest", "Condition", "Observation"];


                fhirAPIs.forEach(function (apiCall) {
                    var relativeURL = smart.server.serviceUrl + "/" + apiCall + "?_id=" + patient.id;
                    /*let  result= doAPICall(relativeURL, token, "application/json", "application/json")                   
                         .then(response => {
                             console.log(response);
                             return response;
                         })
                     */
                    /* .then(json => {
                         return json;
                         
                     });*/

                    let result = doAPICall(relativeURL, token, "application/json", "application/json");
                    /*.catch ((error) => {
                       console.log(error);
                   });*/

                    console.log("json=" + result);
                    //fhirResults[apiCall] = result;
                    console.log("json=" + this.fhirResults[apiCall]);

                }); 
                var obvs = smart.patient.api.fetchAllWithReferences({
                    type: 'Observation',
                    query: {
                        code: {
                            $or: ['http://loinc.org|8302-2', 'http://loinc.org|8462-4',
                                'http://loinc.org|8480-6', 'http://loinc.org|2085-9',
                                'http://loinc.org|2089-1', 'http://loinc.org|55284-4']
                        }
                    }
                });
                $.when(pt, obv).fail(onError);

                $.when(pt, obv).done(function (patient, obv) {
                    var byCodes = smart.byCodes(obv, 'code');
                    var gender = patient.gender;

                    var fname = '';
                    var lname = '';

                    if (typeof patient.name[0] !== 'undefined') {
                        fname = patient.name[0].given.join(' ');
                        lname = patient.name[0].family.join(' ');
                    }

                    var height = byCodes('8302-2');
                    var systolicbp = getBloodPressureValue(byCodes('55284-4'), '8480-6');
                    var diastolicbp = getBloodPressureValue(byCodes('55284-4'), '8462-4');
                    var hdl = byCodes('2085-9');
                    var ldl = byCodes('2089-1');

                    var p = defaultPatient();
                    p.birthdate = patient.birthDate;
                    p.gender = gender;
                    p.fname = fname;
                    p.lname = lname;
                    p.height = getQuantityValueAndUnit(height[0]);

                    if (typeof systolicbp != 'undefined') {
                        p.systolicbp = systolicbp;
                    }

                    if (typeof diastolicbp != 'undefined') {
                        p.diastolicbp = diastolicbp;
                    }

                    p.hdl = getQuantityValueAndUnit(hdl[0]);
                    p.ldl = getQuantityValueAndUnit(ldl[0]);

                    ret.resolve(p);
                });
            } else {
                onError();
            }
        }

        FHIR.oauth2.ready(onReady, onError);
        return ret.promise();

    };

    function defaultPatient() {
        return {
            fname: { value: '' },
            lname: { value: '' },
            gender: { value: '' },
            birthdate: { value: '' },
            height: { value: '' },
            systolicbp: { value: '' },
            diastolicbp: { value: '' },
            ldl: { value: '' },
            hdl: { value: '' },
        };
    }

    function getBloodPressureValue(BPObservations, typeOfPressure) {
        var formattedBPObservations = [];
        BPObservations.forEach(function (observation) {
            var BP = observation.component.find(function (component) {
                return component.code.coding.find(function (coding) {
                    return coding.code == typeOfPressure;
                });
            });
            if (BP) {
                observation.valueQuantity = BP.valueQuantity;
                formattedBPObservations.push(observation);
            }
        });

        return getQuantityValueAndUnit(formattedBPObservations[0]);
    }

    function getQuantityValueAndUnit(ob) {
        if (typeof ob != 'undefined' &&
            typeof ob.valueQuantity != 'undefined' &&
            typeof ob.valueQuantity.value != 'undefined' &&
            typeof ob.valueQuantity.unit != 'undefined') {
            return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
        } else {
            return undefined;
        }
    }
    function getFHIRClient(serverURL, token, contentType, acceptType) {
         

            console.log("serverURL=" + serverURL);

            //client.request("Patient/"+patientID);
            var myHeaders = new Headers();
            myHeaders.append("Authorization", token);
            myHeaders.append("Content-Type", contentType);
            myHeaders.append("Accept", acceptType);
            //myHeaders.append("Cookie", "EpicPersistenceCookie=!N3soogg51eiSXXaWgeFplRcxbLCTJaAUKNt8Z01blDojf1/2t0gSLW48FYGdEoYq68nJjSTaI/QqJ0c=");
            //myHeaders.append("Epic-Client-ID", "d30ed752-70d5-4b77-9484-9b67f6396f63");
            

            var config = {
                // FHIR server base url
                "serverUrl": serverURL,
                // Valid Options are 'same-origin', 'include'
                "credentials": "same-origin",
                "headers": myHeaders,
            }
            console.log("got here");
            var adapter;
            var client = new FHIR.client(config, adapter);
            
            return client;
         
    }
    

    window.drawVisualization = function (p) {
        $('#holder').show();
        $('#loading').hide();
        $('#fname').html(p.fname);
        $('#lname').html(p.lname);
        $('#gender').html(p.gender);
        $('#birthdate').html(p.birthdate);
        $('#height').html(p.height);
        $('#systolicbp').html(p.systolicbp);
        $('#diastolicbp').html(p.diastolicbp);
        $('#ldl').html(p.ldl);
        $('#hdl').html(p.hdl);
    };

})(window);