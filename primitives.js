function centeredSquare(x, y, s) {
  square(x-s/2, y-s/2, s);
}

function centeredTriangle(x, y, s){
  triangle(x+s/2, y+s/2, x-s/2, y+s/2, x, y-s/2);
}