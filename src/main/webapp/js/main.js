// 1. Define route components.
// These can be imported from other files
const selectStopArea = {
		data : function(){
			return {
				query: ''
			}
		},
		template: `<div><form id="search" class="pure-form">
					<input name="query" v-model="query" class="pure-input-rounded pure-input-1" placeholder="Chercher un arrêt">
				</form>
				<ul class="pure-menu-list">
					<li v-for="stop in filteredStops" v-if="stop.type == 1" class="pure-menu-item"><router-link v-bind:to="'/stop/' + stop.uri" class="pure-menu-link">{{ stop.name }}</router-link></li>
				</ul></div>`,
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
		template: '<div><h1>Arrêt : {{ this.$parent.getStopById(idstop) }}</h1><ul class="pure-menu-list"><li v-for="line in this.$parent.lines" class="pure-menu-item"><router-link v-bind:to="\'/stop/\' + idstop +\'/line/\' + line.uri" class="pure-menu-link">{{ line.name }}</router-link></li></ul></div>'
}
const selectMission = { 
		props: ['idstop', 'idline'],
		data: function(){
			return {
				currentMission: null,
				showModal:false,
			}
		},
		template: `
			<div>
				<h1>Arrêt : {{ this.$parent.getStopById(idstop) }}</h1>
				<h2>{{ this.$parent.getLineById(idline) }}</h2>
				<form class="pure-form pure-form-aligned">
				<label :for="mission.uri" class="pure-radio" v-for="mission in this.$parent.currentMissions">
			        <input :id="mission.uri" type="radio" name="optionsRadios" :value="mission" class="pure-radio" v-model="currentMission" @click="showModal = true">
			        {{ mission.name }}
			    </label>
			    </form>
			    <div id="popup1" class="overlay" v-show="showModal">
					<div class="popup">
						<h2>Choose destination</h2>
						<a class="close" href="#" @click="showModal = false">&times;</a>
						<div class="content">
							Choose your destination between Zenbus App and Zenbus Iframe.
						</div>
						<div class="buttons-container">
							<button @click="zenbusRedir(idline, getStop(currentMission, idstop))" class="button-popup">Zenbus App</button>
							<button @click="zenbusLoad(idline, getStop(currentMission, idstop))" class="button-popup">Iframe</button>
						</div>
					</div>
				</div>
						    
			</div>
		`,
		
		methods: {
			getStop: function(mission, stopParentId){
				
				var stopId;
				
				this.$parent.stops.forEach(function(poi){
					if(poi.parent === stopParentId && mission.pois[poi.uri] ){
						stopId = poi.uri;
					}
				});
				
				return stopId;
			},
			
			zenbusRedir: function(routeId, stopId){ 
		        if(Android){ 
		          Android.zenbusRedir("tan", routeId, stopId); 
		        } 
		      }, 
		      
		      zenbusLoad: function(routeId, stopId){ 
			        if(Android){ 
			          Android.zenbusLoad("tan", routeId, stopId); 
			        } 
			      },  
			sendPopup: function(){
				console.log("hello");
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
  { path: '/stop/:idstop/line/:idline', component: selectMission, props: true }
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
	  ]
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
	  getStopByStopAreaMission: function(idStopArea, idMission) {
		  var mission;
		  for(var i = 0; i < this.missions.length; i++) {
			  if(this.missions[i].uri === idMission){
				  mission = this.missions[i];
			  }
		  }
		  var stopsOfArea = [];
		  for(var i = 0; i < this.stops.length; i++){
			  if(this.stops[i].parent === idStopArea){
				  for(var j = 0; j < Object.keys(mission.pois).length; j++) {
					  if (this.stops[i].uri === Object.keys(mission.pois)[j]){
						  return Object.keys(mission.pois)[j];
					  }
				  }
			  }
		  }
	  },
	  
	  alphaSort: function(a, b){
		  if(a.name < b.name) { return -1;}
		  if(a.name > b.name) { return 1; }
	  }
  },
  
  mounted: function() {
	  this.$http.get('http://zenbus.net/api/tan').then(function(response){
		  var content = JSON.parse(response.bodyText);
		  this.stops = content.pois;
		  this.stops.sort(this.alphaSort);
		  
		  this.lines = content.routes;
		  this.lines.sort(this.alphaSort);
		  
		  this.missions = content.missions;
		  this.lines.sort(this.alphaSort);
		  
 	  }.bind(this));
  },
  computed: {
	   currentMissions(){ 
		   return this.missions.filter(mission => {
			   if(mission.route === this.$route.params.idline){
				   return mission;
			   }
		   });
	   }
	  
	}
});