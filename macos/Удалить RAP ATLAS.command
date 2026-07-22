#!/bin/bash
set -u

echo "RAP ATLAS — удаление"
echo "===================="
echo
echo "Будут удалены только следующие файлы:"
echo "  /Applications/RAP ATLAS.app"
echo "  $HOME/Applications/RAP ATLAS.app"
echo "  $HOME/Library/WebKit/io.github.voodkid.rapatlas"
echo "  $HOME/Library/Caches/io.github.voodkid.rapatlas"
echo "  $HOME/Library/Preferences/io.github.voodkid.rapatlas.plist"
echo "  $HOME/Library/Saved Application State/io.github.voodkid.rapatlas.savedState"
echo
read -r -p "Продолжить? [y/N]: " answer
if [[ ! "$answer" =~ ^[Yy]$ ]]; then
  echo "Удаление отменено."
  read -r -p "Нажми Enter, чтобы закрыть окно."
  exit 0
fi

remove_path() {
  local path="$1"
  if [[ ! -e "$path" ]]; then echo "[нет]      $path"; return; fi
  if rm -rf "$path" 2>/dev/null; then
    echo "[удалено]  $path"
  else
    echo "[доступ]   Для удаления $path потребуется пароль владельца Mac"
    sudo rm -rf "$path"
    echo "[удалено]  $path"
  fi
}

remove_path "/Applications/RAP ATLAS.app"
remove_path "$HOME/Applications/RAP ATLAS.app"
remove_path "$HOME/Library/WebKit/io.github.voodkid.rapatlas"
remove_path "$HOME/Library/Caches/io.github.voodkid.rapatlas"
remove_path "$HOME/Library/Preferences/io.github.voodkid.rapatlas.plist"
remove_path "$HOME/Library/Saved Application State/io.github.voodkid.rapatlas.savedState"
echo
echo "Готово. RAP ATLAS и его локальные настройки удалены."
read -r -p "Нажми Enter, чтобы закрыть окно."
