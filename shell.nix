let inherit (import <nixpkgs> {}) fetchFromGitHub mkShellNoCC cacert git; in

let fetchNixpkgs =
  { rev, sha256 ? "" }: import (fetchFromGitHub { owner = "NixOS"; repo = "nixpkgs"; inherit rev sha256; }) {}; in

let inherit (fetchNixpkgs {
  rev = "71caefce12ba78d84fe618cf61644dce01cf3a96"; # 24.11 2025/03/11
  sha256 = "yf3iYLGbGVlIthlQIk5/4/EQDZNNEmuqKZkQssMljuw=";
}) nodejs_22 pnpm_10; in

mkShellNoCC { packages = [ cacert git nodejs_22 pnpm_10 ]; }
