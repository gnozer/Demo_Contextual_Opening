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
					<li v-for="stop in filteredStops" v-if="stop.type == 1" class="pure-menu-item"><router-link v-bind:to="'/stop/' + stop.id" class="pure-menu-link">{{ stop.name }}</router-link></li>
				</ul></div>`,
		computed: {
			 filteredStops() {
			     return this.$parent.stops.filter(stop => {
			       var vm = this;
			       return stop.name.toLowerCase().includes(vm.query.toLowerCase())
			     })
			   }
		}
}
const selectLine = { 
		props: ['idstop'],
		template: '<div><h1>Arrêt : {{ this.$parent.getStopById(idstop) }}</h1><ul class="pure-menu-list"><li v-for="line in this.$parent.lines" class="pure-menu-item"><router-link v-bind:to="\'/stop/\' + idstop +\'/line/\' + line.id" class="pure-menu-link">{{ line.name }}</router-link></li></ul></div>'
}
const selectMission = { 
		props: ['idstop', 'idline'],
		data: function(){
			return {
				idMission:'0',
			}
		},
		template: `
			<div>
				<h1>Arrêt : {{ this.$parent.getStopById(idstop) }}</h1>
				<h2>{{ this.$parent.getLineById(idline) }}</h2>
				<form class="pure-form pure-form-aligned">
				<label :for="mission.id" class="pure-radio" v-for="mission in this.$parent.currentMissions">
			        <input :id="mission.id" type="radio" name="optionsRadios" :value="mission.id" class="pure-radio" v-model="idMission" @click="onClick(idline, getStop(mission, idstop))"> 
			    	{{ mission.name }} 
			    </label>
			    </form>
			</div>
		`,
		
		methods: {
			getStop: function(mission, stopParentId){
				
				var stopId;
				
				this.$parent.stops.forEach(function(poi){
					if(poi.parent === stopParentId && mission.pois[poi.id] ){
						stopId = poi.id;
					}
				});
				
				return stopId;
			},
			
			onClick: function(routeId, stopId){
				if(Android){
					Android.zenbusRedir("tan", routeId, stopId);
				}
				
				/*
				 * TODO an other function to load zenbus in app --> Android.zenbusLoad("tan", routeId, stopId)
				 */
				
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
		  {id:'StopArea:CSMP', name: 'Casimir Périer', type:1},
		  {id:'StopArea:COMM', name: 'Commerce', type:1},
		  {id:'StopArea:CNGO', name: 'Congo', type:1},
		  {id:'StopArea:CORA', name: 'Conraie', type:1},
		  {id:'StopArea:CSVA', name: 'Conservatoire', type:1},
		  {id:'StopArea:COQU', name: 'Coquelicots', type:1},
		  {id:'StopPoint:CSMP2', name: 'Casimir Périer', parent: 'StopArea:CSMP', type:0},
		  {id:'StopPoint:CSMP3', name: 'Casimir Périer', parent: 'StopArea:CSMP', type:0},
		  
	  ],
	  lines: [
		  {id:'26-0', name: '26 - Jonelière - Hôtel de Région'},
		  {id:'36-0', name: '36 - Gréneraie - Croix Jeannette'},
		  {id:'50-0', name: '50 - Basse Indre - Porte de La Chapelle'},
		  {id:'67-0', name: '67 - Le Cellier - Centre de Thouaré'},
		  {id:'85-0', name: '85 - Bois St-Lys - Haluchère - Batignolles'}
	  ],
	  missions: [
		  {id:'16391435-HT19H101-00-25-BLEU', name: 'Hôtel de Région - Jonelière', direction: '0', pois: {'StopPoint:CSMP2': [259]}, routeId:'26-0'},
		  {id:'16391471-HT19H101-00-25-BLEU', name: 'Jonelière - Hôtel de Région', direction: '1', pois: {'StopPoint:CSMP3': [193]}, routeId:'26-0'},
	  ]
  },
  methods: {
	  getStopById: function(id) {
		  for(var i = 0; i < this.stops.length; i++) {
			  if(this.stops[i].id === id){
				  return this.stops[i].name;
			  }
		  }
	  },
	  getLineById: function(id) {
		  for(var i = 0; i < this.lines.length; i++) {
			  if(this.lines[i].id === id){
				  return this.lines[i].name;
			  }
		  }
	  },
	  getStopByStopAreaMission: function(idStopArea, idMission) {
		  var mission;
		  for(var i = 0; i < this.missions.length; i++) {
			  if(this.missions[i].id === idMission){
				  mission = this.missions[i];
			  }
		  }
		  var stopsOfArea = [];
		  for(var i = 0; i < this.stops.length; i++){
			  if(this.stops[i].parent === idStopArea){
				  for(var j = 0; j < Object.keys(mission.pois).length; j++) {
					  if (this.stops[i].id === Object.keys(mission.pois)[j]){
						  return Object.keys(mission.pois)[j];
					  }
				  }
			  }
		  }
	  }
  },
  computed: {
	   currentMissions(){ 
		   return this.missions.filter(mission => {
			   if(mission.routeId === this.$route.params.idline){
				   return mission;
			   }
		   });
	   }
	  
	}
});