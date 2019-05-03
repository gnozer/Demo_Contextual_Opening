// 1. Define route components.
// These can be imported from other files
const selectStopArea = {
		data : function(){
			return {
				query: ''
			}
		},
		template: `<div><form id="search" class="pure-form search-bar">
					<input name="query" v-model="query" class="pure-input-rounded pure-input-1" placeholder="Chercher un arrêt">
				</form>
				<ul class="pure-menu-list stops-list">
					<li v-for="(stop, index) in filteredStops" v-if="stop.type == 1" class="pure-menu-item"><router-link v-bind:to="'/stop/' + stop.uri" class="pure-menu-link">{{ stop.name }}<span class="route-code" v-for="(line, i) in getLinesByStopArea(stop)" :style="{backgroundColor: line.color}">{{ line.code }}</span></router-link></li>
				</ul></div>`,
		methods: {
			getLinesByStopArea: function(stopArea){
				var linesOfStop = [];
				for(var i = 0; i < this.$parent.lines.length; i++){
					for(var j = 0; j < this.$parent.lines[i].stopAreas.length; j++){
						if(stopArea.uri === this.$parent.lines[i].stopAreas[j]){
							linesOfStop.push(this.$parent.lines[i]);
						}
					}
				}
				return linesOfStop;
			}
		},
		computed: {
			 filteredStops() {
			     return this.$parent.stops.filter(stop => {
			       return stop.name.toLowerCase().includes(this.query.toLowerCase())
			     })
			   }
		}
}
const selectLine = { 
		props: ['idstop'],
		template: `<div class="select-line">
						<h2>Arrêt : {{ this.$parent.getStopById(idstop) }}</h2>
						<ul class="pure-menu-list">
							<li v-for="line in this.$parent.currentLines" class="pure-menu-item" :style="{ borderLeft: '3px solid '+ line.color }">
								<router-link v-bind:to="\'/stop/\' + idstop +\'/line/\' + line.uri" class="pure-menu-link">{{ line.name }}</router-link>
							</li>
						</ul>
					</div>`
}

const selectStopAndMission = {
		props: ['idstop', 'idline'],
		data: function(){
			return {
				currentPoi: null,
				showModal:false,
				missionNames : []
			}
		},
		template: `
			<div class="select-mission">
				<h2>Arrêt : {{ this.$parent.getStopById(idstop) }}</h2>
				<h3  :style="{ borderLeft: '3px solid '+ this.$parent.getColorByLineId(idline), paddingLeft:'5px' }">{{ this.$parent.getLineById(idline) }}</h3>
				<form class="pure-form pure-form-aligned">
				<label :for="poi.uri" class="pure-radio" v-for="poi in this.$parent.currentPois" v-if="isPoiForLine(poi, idline)">
			        <input :id="poi.uri" type="radio" name="optionsRadios" :value="poi.uri" class="pure-radio" v-model="currentPoi" @click="showModal = true">
			        <i class="arrow right"></i>{{ poi.name }} - <span class="poi-uri">[{{ poi.uri }}]</span>
			        <ul>
			        	<li v-for="(mission, i) in poi.missions" v-if="((i == 0) || (i > 0 && mission.name != poi.missions[i-1].name)) && poi.missions[i].route == idline">{{ mission.name }}</li>
			        </ul>
			    </label>
			    </form>
			    <div id="popup1" class="overlay" v-show="showModal">
					<div class="popup">
						<h2>Choisissez votre alernative:</h2>
						<a class="close" href="#" @click="showModal = false">&times;</a>
						<div class="content">
							
						</div>
						<div class="buttons-container">
							<button @click="zenbusNative(idline, currentPoi)" class="button-popup pure-button">Zenbus App</button>
							<button @click="zenbusIframe(idline, currentPoi)" class="button-popup pure-button">Webwiew (In App)</button>
						</div>
					</div>
				</div>
			</div>
		`,
		
		methods: {

			  isPoiForLine: function(poi, lineid){
				  for(var i = 0; i < poi.missions.length; i++){
					  if(poi.missions[i].route == lineid){
						  return true;
					  }
				  }
				  return false;
			  },
			zenbusNative: function(routeId, stopId){ 
		        if(Android){ 
		          console.log("route id: " + routeId);
			      console.log("stop id: " + stopId);
		          Android.zenbusNative("tan", routeId, stopId); 
		        }
		      }, 
		      
		      zenbusIframe: function(routeId, stopId){ 
		        if(Android){ 
		          console.log("route id: " + routeId);
		          console.log("stop id: " + stopId);
		          Android.zenbusIframe("tan", routeId, stopId); 
		        }
		      }
		}
}


// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
  { path: '/', component: selectStopArea },
  { path: '/stop/:idstop', component: selectLine, props: true },
  { path: '/stop/:idstop/line/:idline', component: selectStopAndMission, props: true }
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
  routes: routes, // short for `routes: routes
  mode: 'history'
})

// 4. Create and mount the root instance.
// Make sure to inject the router with the router option to make the
// whole app router-aware.
const app = new Vue({
  router,
  el: '#app',
  data: {
	  stops: [
	  ],
	  lines: [		  
	  ],
	  missions: [
	  ],
	  loading:true,
	  version: 0
  },
  methods: {
	  getStopById: function(id) {
		  for(var i = 0; i < this.stops.length; i++) {
			  if(this.stops[i].uri === id){
				  return this.stops[i].name;
			  }
		  }
	  },
	  getLineById: function(id) {
		  for(var i = 0; i < this.lines.length; i++) {
			  if(this.lines[i].uri === id){
				  return this.lines[i].name;
			  }
		  }
	  },
	  getColorByLineId: function(id){
		  for(var i = 0; i < this.lines.length; i++){
			  if(this.lines[i].uri === id){
				  return this.lines[i].color;
			  }
		  }
	  },
	  alphaSort: function(a, b){
		  if(a.name < b.name) { return -1;}
		  if(a.name > b.name) { return 1; }
	  },
	  setDatas: function() {
		  for(var i = 0; i < this.lines.length ; i ++ ){
			  this.lines[i].stops = [];
			  this.lines[i].stopAreas= [];
			  for(var j = 0; j < this.missions.length; j++){
				  if(this.lines[i].uri === this.missions[j].route){
					  for(var k = 0; k < Object.keys(this.missions[j].pois).length; k++) {
						  this.lines[i].stops.push(Object.keys(this.missions[j].pois)[k]);
					  }
				  }
			  }
		  }
		  
		  for(var i = 0; i < this.stops.length; i++){
			  for(var j = 0; j < this.lines.length; j++){
				  for (var k = 0; k < this.lines[j].stops.length; k++){
					  if(this.lines[j].stops[k] === this.stops[i].uri && this.lines[j].stopAreas.indexOf(this.stops[i].parent) === -1){
						  this.lines[j].stopAreas.push(this.stops[i].parent);
					  }
				  }
			  }
			  if(this.stops[i].parent){ 
		          this.stops[i].missions = []; 
		          for(var k = 0; k < this.missions.length; k++){ 
		        	  if(this.missions[k].pois[this.stops[i].uri]){ 
		        		  this.stops[i].missions.push(this.missions[k]) ; 
		        	  } 
		          } 
		      }
		  }
		  
		  this.loading = false;
	  }
  },
  
  mounted: function() {
	  this.loading = true;
	  
	  //var localStorageData =  localStorage.zb_data ? JSON.parse(localStorage.zb_data) : null;  
	  
	  this.$http.get('https://zenbus.net/api/tan').then(function(response){ 
		  
		  var 
		  update = JSON.parse(response.bodyText);
		  
		  console.log(update);
		  
		  this.stops = update.pois; 
		  this.lines = update.routes; 
		  this.missions = update.missions;
		  
		  this.setDatas();
		  
		 /* var 
		  update = JSON.parse(response.bodyText);
		  
		  //Update (or first update)
		  if(!this.localStorageData || this.localStorageData.version != update.v){
			  this.self.stops = update.pois; 
			  this.self.lines = update.routes; 
			  this.self.missions = update.missions;
			  this.self.version = update.v; 
			  
		      localStorage.zb_data = JSON.stringify(this.self.$data);
		      
		  //Force data to localStorage values
		  }else {
			  this.self.stops = this.localStorageData.stops; 	
			  this.self.lines = this.localStorageData.lines;     
			  this.self.missions = this.localStorageData.missions; 
		  }
		  
		  this.self.setDatas();
		  */
	  });
	   
  },
  computed: {
	   currentMissions(){ 
		   return this.missions.filter(mission => {
			   if(mission.route === this.$route.params.idline){
				   return mission;
			   }
		   });
	   },
	   currentPois(){ 
		   return this.stops.filter(stop => {
			   if(stop.parent == this.$route.params.idstop){
				   return stop;
			   }
		   });
	   },
	   currentLines() {
			return this.lines.filter(line => {
				if(line.stopAreas.indexOf(this.$route.params.idstop) != -1){
					return line;
				}
			});
		}
	}
});