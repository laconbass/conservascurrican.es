#
# CUSTOMIZABLE VARS
#
DOMAIN="proba1.currican.lgrv.loc"
PORT=8000
URLS=(
  "/"
  "//"
  "./directorio-raiz/."
  "././directorio-raiz2/."
  "././directorio-raiz3/./"
  "../ruta-non-accesible/.."
  "../ruta-non-accesible2/../.."
  "../ruta-non-accesible3/../../"
  "seccion-hardcoded/../home.js"
  "paxina-que-non-existe"
  "root_wildcard"
  "root_wildcard_slash"
)
#
# SCRIPT VARS
#
METHODS=(HEAD GET POST)
METHODS=(GET POST)
METHODS=(POST)
METHODS=(GET HEAD)
METHODS=(GET POST PUT DELETE)
METHODS=(GET)
METHODS=(HEAD GET POST PUT DELETE)

# HELPER

#
# TEST BEGINS, SHOW COLORED MESSAGE
#
echo -e -n "\033[32m"   # green foreground color
echo "============="
echo "Starting Test"
echo "methods: ${METHODS[@]}"
echo -e -n "\033[0m"    # normal colors
# STORE TIMESTAMP
T1=$(date --rfc-3339=ns)
# ITERATE THROUGHT URLS
for i in ${URLS[@]}; do
  URI="http://$DOMAIN:$PORT"
  if [ $i != "root_wildcard" ]
  then
    URI+="/"
    if [ $i != "root_wildcard_slash" ]
    then
      URI+="$i"
    fi
  fi
  echo "$URI"
  echo -e -n "\033[30m" # dark gray foreground color
  # ITERATE THROUGHT METHODS
  for m in ${METHODS[@]}; do
    curl -sL -w "$m \t%{http_code} %{time_total}s %{size_download}bytes\t%{url_effective}\n" -o /dev/null -X $m $URI 
  done;
  echo -e -n "\033[0m"  # normal colors
done;
# END TIMESTAMP
T2=$(date --rfc-3339=ns)
# CALCULATE TIME STATS
sdiff=$(expr $(date -d "$T2" +%s) - $(date -d "$T1" +%s))
nsdiff=$(expr $(date -d "$T2" +%N) - $(date -d "$T1" +%N))
msdiff=$(((sdiff * 1000) + (nsdiff/1000000)))
# NUMBER OF REQUESTS DONE
requests=$((${#URLS[@]} * ${#METHODS[@]}))
#
# TEST FINISHED, SHOW COLORED STATS
#
echo -e -n "\n"         # empty line
echo -e -n "\033[32m"   # green foreground color

echo "$requests Requests, ${msdiff}ms Total, $((msdiff / requests))ms Average"
echo "methods: ${METHODS[@]}"
echo "Test Finished"
echo "============="
echo -e -n "\033[0m"    # normal colors
