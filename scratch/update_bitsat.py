import json
import os
import re

raw_data = """Campus	Program	Cut-off Score	BITSAT maximum marks
Pilani	B.E. Chemical	247	390
Pilani	B.E. Civil	238	390
Pilani	B.E. Electrical & Electronics	292	390
Pilani	B.E. Mechanical	266	390
Pilani	B.E. Computer Science	327	390
Pilani	B.E. Electronics & Instrumentation	282	390
Pilani	B.E. Electronics & Communication	314	390
Pilani	B.E. Manufacturing	243	390
Pilani	B.E. Mathematics and Computing	318	390
Pilani	B. Pharm	165	390
Pilani	M.Sc. Biological Sciences	236	390
Pilani	M.Sc. Chemistry	241	390
Pilani	M.Sc. Economics	271	390
Pilani	M.Sc. Mathematics	256	390
Pilani	M.Sc. Physics	254	390

Campus	Program	Cut-off Score	BITSAT maximum marks
K K Birla Goa	B.E. Chemical	239	390
K K Birla Goa	B.E. Electrical & Electronics	278	390
K K Birla Goa	B.E. Mechanical	254	390
K K Birla Goa	B.E. Computer Science	301	390
K K Birla Goa	B.E. Electronics & Instrumentation	270	390
K K Birla Goa	B.E. Electronics & Communication	287	390
K K Birla Goa	B.E. Mathematics and Computing	295	390
K K Birla Goa	M.Sc. Biological Sciences	234	390
K K Birla Goa	M.Sc. Chemistry	236	390
K K Birla Goa	M.Sc. Economics	263	390
K K Birla Goa	M.Sc. Mathematics	249	390
K K Birla Goa	M.Sc. Physics	248	390

Campus	Program	Cut-off Score	BITSAT maximum marks
Hyderabad	B.E. Chemical	238	390
Hyderabad	B.E. Civil	235	390
Hyderabad	B.E. Electrical & Electronics	275	390
Hyderabad	B.E. Mechanical	251	390
Hyderabad	B.E. Computer Science	298	390
Hyderabad	B.E. Electronics & Instrumentation	270	390
Hyderabad	B.E. Electronics & Communication	284	390
Hyderabad	B.E. Mathematics and Computing	293	390
Hyderabad	B. Pharm	161	390
Hyderabad	M.Sc. Biological Sciences	234	390
Hyderabad	M.Sc. Chemistry	235	390
Hyderabad	M.Sc. Economics	261	390
Hyderabad	M.Sc. Mathematics	247	390
Hyderabad	M.Sc. Physics	245	390"""

campus_map = {
    'Pilani': 'BITS_PILANI',
    'K K Birla Goa': 'BITS_GOA',
    'Hyderabad': 'BITS_HYD'
}

# 0: institute_code
# 1: program_code
# 2: program_name
# 3: quota
# 4: seat_type
# 5: gender (M/F/N)
# 6: opening_rank
# 7: closing_rank
# 8: round
# 9: year
# 10: counseling

new_cutoffs = []
for line in raw_data.split('\n'):
    line = line.strip()
    if not line or line.startswith('Campus'):
        continue
    parts = re.split(r'\t|\s{2,}', line)
    if len(parts) >= 3:
        campus = parts[0].strip()
        program = parts[1].strip()
        score = parts[2].strip()
        
        if campus in campus_map and score.isdigit():
            inst_code = campus_map[campus]
            prog_code = re.sub(r'[^A-Z]', '', program.upper())
            # Add entry to new_cutoffs array of array
            new_cutoffs.append([
                inst_code,
                prog_code,
                program,
                "AI",
                "OPEN",
                "N", # Gender-Neutral
                390, # BITSAT Max marks
                int(score),
                1,
                2024,
                "BITSAT"
            ])

file_path = 'client/college-predictor/public/data/cutoffs-all.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Filter out old BITSAT or malformed data
# Also filter out anything that is a dict (if previous run corrupted it)
filtered_data = [item for item in data if isinstance(item, list) and len(item) > 10 and item[10] != 'BITSAT']

filtered_data.extend(new_cutoffs)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(filtered_data, f, separators=(',', ':'))

print(f"Successfully populated {len(new_cutoffs)} BITSAT 2024 cutoffs!")
