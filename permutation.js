var imgs = [{name:"a",position:0},
            {name:"b",position:1},
            {name:"c",position:2}];

var seq = [0,2,1];
// console.log(permutation(imgs,seq));

imgs = permutation(imgs,seq);
for(i=0;i<imgs.length;i++){
    console.log(imgs.find(function(img){
        return img.position==i;
    }));
}

function permutation(objs,seq){
    for(i=0;i<seq.length;i++){
        objs[i].position = seq.indexOf(i);
    }
    return objs;
}