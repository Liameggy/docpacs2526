import json
import csv

# --------------------------
# CONFIG
# --------------------------

JSON_FILE = "10th.json"   # or replace with your JSON filename
OUTPUT_CSV = "10th_output.csv"
SECTION_ID = 1  # <- choose the section number you want to extract
# Or set SECTION_NAME instead:
SECTION_NAME = None  # e.g., "Python Basics"


# --------------------------
# HELPERS
# --------------------------

def index_to_letter(index: int) -> str:
    """Convert 0-based index to A/B/C/D."""
    return ["A", "B", "C", "D"][index]


# --------------------------
# MAIN LOGIC
# --------------------------

def main():
    # Load JSON
    with open(JSON_FILE, "r", encoding="utf8") as f:
        data = json.load(f)

    # Find section
    section = None
    for sec in data["sections"]:
        if SECTION_NAME and sec["name"] == SECTION_NAME:
            section = sec
            break
        if SECTION_ID and sec["id"] == SECTION_ID:
            section = sec
            break

    if not section:
        print("ERROR: Section not found.")
        return

    rows = []

    # Extract units → tasks → questions
    for unit in section["units"]:
        unit_name = unit["name"]

        for task in unit["tasks"]:
            task_name = task["name"]

            for question in task.get("questions", []):
                q_prompt = question["prompt"]
                correct_index = question["correctIndex"]
                correct_row = index_to_letter(correct_index)

                # Ensure exactly 4 answers
                answers = question["answers"]
                answers += [""] * (4 - len(answers))

                row = [
                    unit_name,
                    task_name,
                    q_prompt,
                    "Multiple Choice",
                    correct_row,
                    answers[0],
                    answers[1],
                    answers[2],
                    answers[3],
                ]
                rows.append(row)

    # --------------------------
    # WRITE CSV (comma-delimited with proper escaping)
    # --------------------------
    header = [
        "Unit",
        "Task",
        "Question",
        "Type",
        "Correct Row",
        "Answer",
        "Answer",
        "Answer",
        "Answer",
    ]

    with open(OUTPUT_CSV, "w", encoding="utf8", newline="") as f:
        writer = csv.writer(
            f,
            delimiter=",",
            quotechar='"',
            quoting=csv.QUOTE_MINIMAL
        )
        writer.writerow(header)
        writer.writerows(rows)

    print(f"CSV created successfully: {OUTPUT_CSV}")


if __name__ == "__main__":
    main()