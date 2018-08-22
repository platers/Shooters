//vars

function Chromosome(net) {
  this.gene = [];
  this.fitness = 0;

  this.randomNet = function(){
    var layer_defs = [];
    // input layer of size 1x1x2 (all volumes are 3D)
    layer_defs.push({type:'input', out_sx:13, out_sy:1});
    // some fully connected layers
    layer_defs.push({type:'fc', num_neurons:10, activation:'relu'});
    layer_defs.push({type:'fc', num_neurons:10, activation:'relu'});
    // a softmax classifier predicting probabilities for two classes: 0,1
    layer_defs.push({type:'regression', num_neurons:3});
    
    var net = new convnetjs.Net();
    net.makeLayers(layer_defs);
    return net;
  }
  this.mutate = function () {

  }
  this.crossover = function (chromosome) {

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

const PopulationSize = 5;

function Population() {
  this.Chromosomes = [];
  this.size = PopulationSize;
  
  this.randomPopulation = function () {
    for(var i = 0; i < this.size; i++){
      var Chrome = new Chromosome();
      this.Chromosomes.push(Chrome);
    }
  }
  this.newPopulation = function () {
    
  }
  this.testPopulation = function () {
        
  }
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