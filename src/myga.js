//vars

function Chromosome(net) {
  this.gene = [];
  this.fitness = 0;

  this.randomNet = function(){
    var layer_defs = [];
    // input layer of size 1x1x2 (all volumes are 3D)
    layer_defs.push({type:'input', out_sx:16, out_sy:1, out_depth:1});
    // some fully connected layers
    layer_defs.push({type:'fc', num_neurons:20, activation:'sigmoid'});
    layer_defs.push({type:'fc', num_neurons:20, activation:'sigmoid'});
    // a softmax classifier predicting probabilities for two classes: 0,1
    layer_defs.push({type:'regression', num_neurons:3});
    
    var net = new convnetjs.Net();
    net.makeLayers(layer_defs);
    return net;
  }
  this.mutate = function () {
    var n = this.gene.length;
    for(var i = 0; i < n; i++){
      this.gene[i] += randomNoise(0);
      //console.log(randomNoise(this.gene[i]));
    }
  }
  this.crossover = function (chromosome) {  //simple 1 point
    var n = chromosome.gene.length;
    var idx = Math.floor(Math.random() * n);  //idx is crossover point
    var c = chromosome.copy();
    for(var i = 0; i <= idx; i++){
      this.gene[i] = c.gene[i];
    }
  }
  this.copy = function(){
    var copy = new Chromosome();
    copy.gene = this.gene.slice();
    return copy;
  }
  this.geneToNet = function () {
    var count = 0;
    var layer = null;
    var filter = null;
    var bias = null;
    var w = null;
    var net = this.randomNet();
    var i, j, k;
    for ( i = 0; i < net.layers.length; i++) {
      layer = net.layers[i];
      filter = layer.filters;
      if (filter) {
        for ( j = 0; j < filter.length; j++) {
          w = filter[j].w;
          for ( k = 0; k < w.length; k++) {
            w[k] = this.gene[count++];
          }
        }
      }
      bias = layer.biases;
      if (bias) {
        w = bias.w;
        for ( k = 0; k < w.length; k++) {
          w[k] = this.gene[count++];
        }  
      }
    }
    return net;
  }
  this.netToGene = function (net) {
    var gene = [];
    var layer = null;
    var filter = null;
    var bias = null;
    var w = null;
    var i, j, k;
    for (i = 0; i < net.layers.length; i++) {
      layer = net.layers[i];
      filter = layer.filters;
      if (filter) {
        for (j = 0; j < filter.length; j++) {
          w = filter[j].w;
          for (k = 0; k < w.length; k++) {
            gene.push(w[k]);
          }
        }
      }
      bias = layer.biases;
      if (bias) {
        w = bias.w;
        for (k = 0; k < w.length; k++) {
          gene.push(w[k]);
        }
      }
    }
    return gene;
  }
  
  if(net) this.gene = this.netToGene(net);
  else this.gene = this.netToGene(this.randomNet());
}

const PopulationSize = 100;

function Population() {
  this.Chromosomes = [];
  
  this.randomPopulation = function () {
    for(var i = 0; i < PopulationSize; i++){
      var Chrome = new Chromosome();
      this.Chromosomes.push(Chrome);
    }
  }
  this.newGeneration = function (chromosomes) {
    this.Chromosomes = [];
    for(var i = 0; i < chromosomes.length; i++){
      this.Chromosomes.push(chromosomes[i].copy());
      this.Chromosomes[i].mutate();
    }
    while(this.Chromosomes.length < PopulationSize){
      var a = randomElement(chromosomes).copy();
      var b = randomElement(chromosomes).copy();
      a.crossover(b);
      a.mutate();
      
      this.Chromosomes.push(a);
    }
  }
}

function randomNoise(x){
  return x + convnetjs.randn(0.0, 1);
}

function randomElement(array){
  var item = array[Math.floor(Math.random()*array.length)];
  return item;
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}