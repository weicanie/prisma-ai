#!/bin/bash
# test_wiki.sh - Test script for the deepwiki-to-md wiki command
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
target="langchain-ai/langchain"

url="${base_url}/${target}"

# clear
rm -fr "${base_dir_actual}/wiki"


# ----------------------------------------------------------------------
# when
# ----------------------------------------------------------------------
# TODO chatとwikiでapiが揃ってない
# python -m src.interface.cli wiki "${url}" -o "${base_dir_actual}"
export PYTHONPATH=.
python src/interface/cli.py wiki \
  "${url}" \
  -o "${base_dir_actual}"




# ----------------------------------------------------------------------
# then
# ----------------------------------------------------------------------
# ------------------------------
# md
# ------------------------------
for md_file in ${base_dir_actual}/wiki/${target}/*.md; do
  base_name=$(basename "$md_file")
  expect_md="${base_dir_expect}/wiki/${target}/${base_name}"
  
  if [ ! -f "$expect_md" ]; then
    echo "Expected md file not found: $expect_md" >&2
    exit 1
  fi

  # 正規化して比較
  diff -u "$md_file" "$expect_md"
  if [ $? -ne 0 ]; then
    echo "md file is different: $base_name" >&2
    exit 1
  fi
done


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

for svg_file in ${base_dir_actual}/wiki/${target}/images/*.svg; do
  base_name=$(basename "$svg_file")
  expect_svg="${base_dir_expect}/wiki/${target}/images/${base_name}"
  
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
