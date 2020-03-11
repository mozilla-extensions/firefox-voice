#/bin/bash
# Note, this script is run on our servers to update the XPI
# It is not runnable from the repository

# Note, this wraps update_xpi.sh for use with cron. The crontab looks like:
# 0,5,10,15,20,25,30,35,40,45,50,55 * * * * ~/update_xpi_cron.sh


log="./update_xpi.log"
echo >> $log
date >> $log
./update_xpi.sh 2>&1 >> $log
echo "Exit with $? at $(date)" >> $log
echo "--------------------------------------------------------------" >> $log
