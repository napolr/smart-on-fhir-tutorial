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
                let result = getData(smart, patient);


                /* var allergyIntolerance = smart.patient.api.fetchAll({
                     type: 'AllergyIntolerance',
 
                 });*/
                /*
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

                console.log("observation=" + obv);
                */
            } else {
                onError();
            }
        }

        async function getData(smart, patient) {
            //.log("smart=" + JSON.stringify(smart)); 

            //   console.log("srverURL =" + smart.server.serviceUrl); 


            var token = smart.server.auth.type + " " + smart.server.auth.token;
            var token = smart.tokenResponse.token_type + " " + smart.tokenResponse.access_token;
            // console.log("token=" + token);

            fhirAPIs = ["Patient", "AllergyIntolerance", "MedicationRequest", "Condition", "Observation"];

            
            fhirAPIs.forEach(function (apiCall) {
                var relativeURL = smart.server.serviceUrl + "/" + apiCall + "?_id=" + patient.id;
                result= doAPICall(relativeURL, token, "application/json", "application/json")                   
                     .then(response => {
                         console.log(response.json);
                         return response;
                     })
                    .then(result => { console.log(result);})
                
                                    
            });

           

            //$.when(pt, obv).fail(onError);

            // $.when(pt, obv).done(function (patient, obv) {
            //     var byCodes = smart.byCodes(obv, 'code');
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

    /* function getBloodPressureValue(BPObservations, typeOfPressure) {
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
     */

    async function doAPICall(relativeURL, token, contentType, acceptType, callback) {
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
    
        result = await fetch(relativeURL, requestOptions)
            .then(response => {
                console.log(response);
                return response.json();
            });
           


        // return response.json();
        // }
        // console.log(relativeURL)
        // console.log(json);

         return response;  
    }



   


    /*
        function getAllergyIntolerances(smart) {
            var allergyIntolerance = null;
            var allergyIntolerance = smart.patient.api.fetchAll({
                type: 'AllergyIntolerance',
                
            });
    
            
            console.log(allergyIntolerance);
            entries = null;
            entries = allergyIntolerance.entries;
           
            console.log(allergyIntolerance.allergies);
            allergyIntolerance.
            if (entries !== null) {
                var allergyTableHeader = "<table><tr><td>item</td><td>category</td><td>reaction</td></tr>";
                var j = 0;
                allergyRows = "";
                var rows = "";
                entries.forEach(function (allergy, j) {
    
    
                    //log.debug(JSON.stringify(allergy));
                    //log.debug("allergy.resource.code"+JSON.stringify(allergy.resource));
    
                    if (allergy.resource.code && allergy.resource.code != "invalid") {
                        rows += "<tr><td>" + allergy.resource.code.text + "</td><td>" + allergy.resource.category + "</td><td>";
                    }
    
                    var i = 0;
                    if (allergy.resource.reaction) {
                        allergyReactions = "";
                        allergy.resource.reaction.forEach(function (reaction) {
    
                            if (i === 0) {
                                allergyReactions = reaction.description + "(" + reaction.severity + ")";
                            } else {
                                allergyReactions = ", " + reaction.description + "(" + reaction.severity + ")";
                            }
                        });
                        rows += "<td>" + allergyReactions + "</td>";
                        rows += "</tr>";
                    }
                    // log.debug("rows="+rows);
    
    
                });
                //log.debug("allergies="+rows);
                allergies = allergyTableHeader + rows + "</table>";
                return (allergies);
            }
        }*/

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
