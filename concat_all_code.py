import os

# ------------------------------------------------------------
# CONFIG
# ------------------------------------------------------------
ROOT_DIR = "."  # Root of your project
OUTPUT_FILE = "MTN_CODE_OUTPUT.txt"

# Include only these code file extensions
INCLUDE_EXTENSIONS = (".py", ".ts", ".tsx", ".js", ".jsx",".css", ".html",".json", ".md",".cjs",".json")

# Exclude these folders from scanning
EXCLUDE_DIRS = {"node_modules", ".venv", "__pycache__", "__tests__", "tests"}

# ------------------------------------------------------------
# HELPER: Collect all matching files recursively
# ------------------------------------------------------------
def collect_files(root_dir):
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Skip excluded directories
        dirnames[:] = [
            d for d in dirnames
            if d not in EXCLUDE_DIRS
            and not any(ex in d.lower() for ex in ["node_modules", ".venv", "test"])
        ]

        for file in filenames:
            if file.endswith(INCLUDE_EXTENSIONS):
                yield os.path.join(dirpath, file)

# ------------------------------------------------------------
# HELPER: Build formatted output
# ------------------------------------------------------------
def build_output():
    lines = []
    for path in sorted(collect_files(ROOT_DIR)):
        rel_path = os.path.relpath(path, ROOT_DIR).replace("\\", "/")

        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as file:
                content = file.read().rstrip()
        except Exception as e:
            content = f"// ⚠️ Could not read file: {e}"

        # Add header + file contents
        lines.append(f"// {rel_path}\n{content}\n")

    return ("\n\n\n\n".join(lines)).strip()

# ------------------------------------------------------------
# MAIN
# ------------------------------------------------------------
if __name__ == "__main__":
    output = build_output()
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(output)

    print(f"✅ Combined code written to {OUTPUT_FILE}")
    print(f"📁 Excluded folders: {', '.join(EXCLUDE_DIRS)}")
