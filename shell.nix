let inherit (import <nixpkgs> {}) fetchFromGitHub mkShellNoCC cacert git; in

let fetchNixpkgs =
  { rev, sha256 ? "" }: import (fetchFromGitHub { owner = "NixOS"; repo = "nixpkgs"; inherit rev sha256; }) {}; in

let inherit (fetchNixpkgs {
  rev = "48652e9d5aea46e555b3df87354280d4f29cd3a3"; # 25.11 2026/03/17
  sha256 = "xB30bbAp0e7ogSEYyc126mAJMt4FRFh8wtm6ADE1xuM=";
}) nodejs_22 pnpm_10; in

mkShellNoCC { packages = [ cacert git nodejs_22 pnpm_10 ]; }
