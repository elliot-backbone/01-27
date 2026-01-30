#!/bin/bash
# Phase 4.5.2 - Delete kill list files

rm -f predict/valueVector.js
rm -f predict/weeklyValue.js

echo "✓ Deleted valueVector.js"
echo "✓ Deleted weeklyValue.js"
echo ""
echo "Remaining predict files:"
ls predict/
