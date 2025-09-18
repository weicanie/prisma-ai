#!/bin/bash
readonly wk_dir_script="$(dirname $0)"
readonly dir_root="$(cd ${wk_dir_script}/../..; pwd)"
cd "${dir_root}" || exit 1


# ----------------------------------------------------------------------
# const
# ----------------------------------------------------------------------
readonly base_url="https://deepwiki.com"
readonly base_dir_actual="test/size_L/actual"
readonly base_dir_expect="test/size_L/expect"


# ----------------------------------------------------------------------
# given
# ----------------------------------------------------------------------
target="search/c4_a06e7db5-c0b8-4899-a80a-84cf8f36347d"

url="${base_url}/${target}"
dir_output="${base_dir_actual}"
chat_id=$(basename ${target})

# clear
rm -fr "${dir_output}"


# ----------------------------------------------------------------------
# when
# ----------------------------------------------------------------------
export PYTHONPATH=.
python src/interface/cli.py chat \
  "${url}" \
  -o "${dir_output}"


# ----------------------------------------------------------------------
# then
# ----------------------------------------------------------------------
# ------------------------------
# md
# ------------------------------
diff -u \
  ${base_dir_actual}/chat/${chat_id}/chat.md \
  ${base_dir_expect}/chat/${chat_id}/chat.md
if [ $? -ne 0 ]; then
  echo "md file is different" >&2
  exit 1
fi


# ------------------------------
# images
# ------------------------------
normalize_svg() {
  # IDや一時的な値を削除し、数値を丸めるなど
  sed -e 's/ \#mermaid-.*{//' \
      -e 's/#mermaid-.*_class-//g' \
      -e 's/#mermaid-.*_flowchart-//g' \
      -e 's/id="[^"]*"//g' \
      -e 's/transform="[^"]*"//g' \
      -e 's/d="[^"]*"//g' \
      -e 's/\([0-9]\+\.[0-9]\{2\}\)[0-9]*/\1/g' \
      "$1"
}

for svg_file in ${base_dir_actual}/chat/${chat_id}/images/*.svg; do
  base_name=$(basename "$svg_file")
  expect_svg="${base_dir_expect}/chat/${chat_id}/images/${base_name}"
  
  if [ ! -f "$expect_svg" ]; then
    echo "Expected SVG file not found: $expect_svg" >&2
    exit 1
  fi

  # 正規化して比較
  normalize_svg "$svg_file" > /tmp/actual.svg
  normalize_svg "$expect_svg" > /tmp/expect.svg
  diff -u /tmp/actual.svg /tmp/expect.svg
  if [ $? -ne 0 ]; then
    echo "SVG file is different: $base_name" >&2
    exit 1
  fi
done
