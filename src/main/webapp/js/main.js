// 1. Define route components.
// These can be imported from other files
const Foo = { template: '<h1>Stop id : {{ getStopById($route.params.idstop) }}</h1>' }
const Bar = { template: '<div>bar</div>' }

// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
  { path: '/stop/:idstop', component: Foo },
  { path: '/bar', component: Bar }
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
	  query: '',
	  stops: [
		  {id:'StopArea:COMM', name: 'Commerce'},
		  {id:'StopArea:CNGO', name: 'Congo'},
		  {id:'StopArea:CORA', name: 'Conraie'},
		  {id:'StopArea:CSVA', name: 'Conservatoire'},
		  {id:'StopArea:COQU', name: 'Coquelicots'},
		  
	  ]
  },
  methods: {
	  getStopById: function(id) {
		  return this.stops.filter(obj => {
			  return obj.id === id
		  })
	  }
  },
  computed: {
	   filteredList() {
	     return this.stops.filter(stop => {
	       var vm = this;
	       return stop.name.toLowerCase().includes(vm.query.toLowerCase())
	     })
	   }
	}
})