(function (window) {
    var fhirResults = [];
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
               let result=  getData(smart, patient );
                

            } else {
                onError();
            }
        }

        async function getData(smart, patient ) { 
               
                var token = smart.server.auth.type + " " + smart.server.auth.token;
                var token = smart.tokenResponse.token_type + " " + smart.tokenResponse.access_token;
   

                fhirAPIs = ["Patient","AllergyIntolerance","MedicationRequest","Condition","Observation"];

                
                fhirAPIs.forEach(function (apiCall) {
                    var relativeURL =   smart.server.serviceUrl + "/" + apiCall + "?_id=" + patient.id;

                    let result =   doAPICall(relativeURL, token, "application/json", "application/json"); 
                     /*.catch ((error) => {
                        console.log(error);
                    });*/

                    console.log("json=" + result);
                    //fhirResults[apiCall] = result;
                    console.log("json=" + this.fhirResults[apiCall]);
                    
                });

            var gender = patient.gender;
            pt = fhirResults["Patient"];
                patientName = pt.entry.resource.name;
                    var fname = '';
                    var lname = '';

                if (typeof patientName[0] !== 'undefined') {
                    fname = patientName[0].given.join(' ');
                    lname = patientName[0].family.join(' ');
            }
            
                    //console.log(patient);
                    ///var height = byCodes('8302-2');
                   // var systolicbp = getBloodPressureValue(byCodes('55284-4'), '8480-6');
                   // var diastolicbp = getBloodPressureValue(byCodes('55284-4'), '8462-4');
                   // var hdl = byCodes('2085-9');
                   // var ldl = byCodes('2089-1');
                   
                   
                var p = defaultPatient();
                    //added patient

                p.id = patient.id; 
                p.birthdate = pt.entry.resource.birthDate;
                p.gender = pt.entry.resource.gender;
                p.fname = fname;
                p.lname = lname;
                
                  // p.allergies = getAllergyIntolerances(smart);
                  //  if (typeof systolicbp != 'undefined') {
                   //     p.systolicbp = systolicbp;
                  //  }

                   // if (typeof diastolicbp != 'undefined') {
                   //     p.diastolicbp = diastolicbp;
                   // }

                  //  p.hdl = getQuantityValueAndUnit(hdl[0]);
                  //  p.ldl = getQuantityValueAndUnit(ldl[0]);

                    ret.resolve(p);
               // });

            return p;
           
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
            id: { value: '' },
        };
    }

  

     async function  doAPICall(relativeURL,token,contentType,acceptType,callback) {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", token);
        myHeaders.append("Content-Type", contentType);
        myHeaders.append("Accept", acceptType);
     
        var raw = "";

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            //body: raw,
            redirect: 'follow'
        };

         response = await fetch(relativeURL, requestOptions) 
             .then(response => response.json())
             .then (result=> callback(result))
 
    }



    async function getResult(data) {
      
        console.log("got here");
        console.log(data);
        fhirResults[apiCall] = result;
        this.data = results;

        }

  



    window.drawVisualization = function (p) {
        $('#holder').show();
        $('#loading').hide();
        $('#id').html(p.id);
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
