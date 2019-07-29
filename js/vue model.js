<template>
<div class="hello">
  {{searchText}}
<input v-model="searchText"/>
  {{searchDemo}}
<input
      @value="searchDemo"
      @input="searchDemo = $event.target.value"
  />
  </div>
  </template>

  <script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      searchText: '',
      searchDemo: '',
    }
  },
  methods:{
    inputChang(e){
      console.log(e);
      //this.searchDemo=e.target.value
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>