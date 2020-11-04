with import <nixpkgs> {}; {
  nodeEnv = stdenv.mkDerivation {
    name = "node";
    buildInputs = [ nodejs-15_x ];
  };
}
