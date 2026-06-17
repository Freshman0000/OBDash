import re

with open('./components/Gauge.tsx', 'r') as f:
    lines = f.readlines()

for i in range(len(lines)):
    if '{rpm}' in lines[i]:
        # Check current line
        if 'className=' in lines[i]:
            lines[i] = lines[i].replace('font-micro', 'font-lcd').replace('font-sans', 'font-lcd').replace('font-mono', 'font-lcd')
        # Check previous line
        elif i > 0 and 'className=' in lines[i-1]:
            lines[i-1] = lines[i-1].replace('font-micro', 'font-lcd').replace('font-sans', 'font-lcd').replace('font-mono', 'font-lcd')

with open('./components/Gauge.tsx', 'w') as f:
    f.writelines(lines)
print("Done")
