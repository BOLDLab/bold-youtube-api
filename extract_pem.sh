cat ~/Downloads/UoN\ BOLD\ Video\ Analytics-10db02ef2cf4.json | python3 -c "import sys, json; print(json.load(sys.stdin)['private_key'])" > google_service.pem
