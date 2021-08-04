(function(){
    let latlngs="";
    let array_localidad= [];
    let polygon='';
    let search = '15';
    var map = L.map('map').setView([4.60971, -74.08175], 14);
    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    async function GetLocalidad(){
        const url_localidad = "http://serviciosgis.catastrobogota.gov.co/otrosservicios/rest/services/educacion/inversion/MapServer/0?f=pjson";		
        let resp='';
        document.getElementById("map").style.visibility = "hidden";
        const Localidad = await fetch(url_localidad);
        if (!Localidad.ok){
            throw new Error("GetLocalidad - 404 API REST Localidades");
        }
        resp = Localidad.json();
        document.getElementById("map").style.visibility = "visible";
        return resp;
    }

    function GetInfo(Localidad){
        let ContentButton='';
        for(var i in Localidad.fields[6].domain.codedValues){
            let color = '{"color": "'+GetRandomColor()+'"}';
            array_localidad.push( [Localidad.fields[6].domain.codedValues[i].code,  Localidad.fields[6].domain.codedValues[i].name,"[]",color]);
        } 
        let k = 0;

        //array_localidad.sort((a, b) => a[1].localeCompare(b[1]));
        ordenar_localidades(array_localidad);
        while (k<array_localidad.length)
        { 
            ContentButton += '<a href="#" data-id_localidad="'+array_localidad[k][0]+'" class="btn_localidad btn btn-default btn-block" role="button"><span class="pull-left">'+array_localidad[k][1]+'</span>&nbsp;</a>';
            k++;
        }
        //const row = array_localidad.findIndex(row => row.includes(search));
        document.getElementById("LocalButton").innerHTML=ContentButton;
        ActiveButtons();
    }
    
    
    function drawMap (id_localidad){
        row = SearchLocalidad(id_localidad);
        const json_coord =JSON.parse(array_localidad[row][2]);
        const json_color =JSON.parse(array_localidad[row][3]);
        if (polygon != ""){
            map.eachLayer(layer => {
                layer.remove()
                L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
            })
        }
    
		polygon = L.polygon(json_coord, json_color).addTo(map);		
    }
    function GetRandomColor() {
        let color = '#';
        for (var i = 0; i < 6; i++) {
            color += Math.floor(Math.random() * 10);
        }
        return color;
    }

    function ActiveButtons(){
        var buttons = document.querySelectorAll(".btn_localidad").length;

        for (var i = 0; i < buttons ; i++) {
            document.querySelectorAll(".btn_localidad")[i].addEventListener("click", function() {
                row = SearchLocalidad(this.dataset.id_localidad)
                document.getElementById("Title").innerHTML = "Mapa Localidad "+ array_localidad[row][0] + " - "+ array_localidad[row][1]+" Bogotá D.C ";
                drawMap(this.dataset.id_localidad)
            });
        }		
    }
    function SearchLocalidad(IdLocalidad){
        const row = array_localidad.findIndex(row => row.includes(IdLocalidad));
        return row;
    }

    async function LoadInfo(){
        let resp;
        const url_service = "https://serviciosgis.catastrobogota.gov.co/otrosservicios/rest/services/educacion/inversion/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Meter&relationParam=&outFields=&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=geojson";
        const GeoLoc = await fetch(url_service);
        if (!GeoLoc.ok){
            throw new Error("GetLocalidad - 404 API REST COORDENADAS");
        }
        else
        {
            resp = GeoLoc.json();
        }
        return resp;
    }
    function ViewInfo(GeoLoc){
        let count = 0;			
            GeoLoc['features'].forEach(function(elemento, indice, array) {
                latlngs = "[";
                elemento.geometry.coordinates[0].forEach(function(elemento2, indice2, array) {
                    if (latlngs != "[") latlngs += ", ";	
                    latlngs += "["+elemento2[1]+","+elemento2[0]+"]";
                    count++;
                })
                latlngs += "]";
                row = SearchLocalidad(elemento.properties.COD_LOCA);
                array_localidad[row][2] = latlngs;
                console.log(array_localidad[row][0]+ " - "+array_localidad[row][1]+ " - "+count+" - Color: "+array_localidad[row][3]);
            })
    }

    function ordenar_localidades(lista){
        
        var n, i, k, aux;
        n = lista.length;
        //console.log(lista); // Mostramos, por consola, la lista desordenada
        // Algoritmo de burbuja
        for (k = 1; k < n; k++) {
            for (i = 0; i < (n - k); i++) {
                if (lista[i][1] > lista[i + 1][1]) {
                    aux = lista[i];
                    lista[i] = lista[i + 1];
                    lista[i + 1] = aux;
                }
            }
        }
    
        console.log(lista); // Mostramos, por consola, la lista ya ordenada
    

    }

    //GetLocalidad().then(GetInfo);
    const prepareLocalidad = () =>{
        return new Promise((resolve,reject)=>{
            GetLocalidad().then(GetInfo);
            setTimeout(
                function (){
                    //array_localidad=[];
                    if(array_localidad.length>0){
                        resolve("OK");
                    }
                    else{
                        reject("ERROR");
                    }
                },
                1000
            );
        })
    }
    prepareLocalidad()
    .then(response => console.log(response))
    .then(response => LoadInfo().then(ViewInfo))
    .catch(reject =>console.log("fallo: "+reject));
}
)();