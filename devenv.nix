{
  pkgs,
  lib,
  config,
  ...
}:
{
  # https://devenv.sh/languages/
  languages.javascript = {
    enable = true;
    yarn = {
      enable = true;
      install.enable = true;
    };
  };

  # Vite is typically installed as a devDependency in the project's package.json.
  # We include nodejs as the runtime.
  packages = [ pkgs.nodejs ];

  # See full reference at https://devenv.sh/reference/options/
}

