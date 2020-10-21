class ECountDown {

    interval = null;

    static INSTANCE = new ECountDown();

    init() {
        let params = new URLSearchParams(window.location.search);
        let share = params.get("share");
        try {
            if(share) {
                share = JSON.parse(atob(share));
                this.runCountDown(share.d, share.h, share.z, share.t);
                document.getElementById("countDown").hidden = false;
                document.getElementById("submitForm").hidden = true;
            }
        } catch (e) {
            console.error(e);
        }
        this.initZones();
        document.getElementById("zone").value = DateUtils.getDefaultZone();
        document.getElementById("newEventLink").href = this.getBaseUrl();
    }

    submitClicked(event) {
        event.preventDefault();
        try {
            let dateValue = event.target.date.value;
            let timeValue = event.target.time.value;
            let zoneValue = event.target.zone.value;
            let titleValue = event.target.title.value;
            window.location = this.getShareUrl(dateValue, timeValue, zoneValue, titleValue);
        } catch (e) {
            console.error(e);
        }
    }

    initZones() {
        let zones = DateUtils.getTimeZones();
        zones.sort();
        zones.forEach(zone => {
            let zoneElement = document.createElement("option");
            zoneElement.innerText = zone;
            document.getElementById("zones").appendChild(zoneElement);
        })
    }


    getShareUrl(dateValue, timeValue, zoneValue, titleValue) {
        return this.getBaseUrl() + "?share=" + btoa(JSON.stringify({
            d: dateValue,
            h: timeValue,
            z: zoneValue,
            t: titleValue
        }));
    }

    getBaseUrl() {
        return window.location.href.split('?')[0];
    }

    runCountDown(dateValue, timeValue, zoneValue, titleValue) {
        let date = new Date(dateValue + " " + timeValue);
        let calculation = this.calculateCountDown(date, zoneValue);

        document.getElementById("eventTitle").innerText = titleValue;
        document.getElementById("yourTime").innerText = calculation.your.time;
        document.getElementById("yourZone").innerText = calculation.your.zone;
        document.getElementById("theirTime").innerText = calculation.their.time;
        document.getElementById("theirZone").innerText = calculation.their.zone;

        if (this.interval != null) clearInterval(this.interval);
        this.interval = setInterval(() => {

            let calculation = this.calculateCountDown(date, zoneValue);
            document.getElementById("untilHours").innerText = "" + calculation.until.hours;
            document.getElementById("untilMinutes").innerText = "" + calculation.until.minutes;
            document.getElementById("untilSecond").innerText = "" + calculation.until.seconds;

        }, 500);
    }


    calculateCountDown(date, zone) {
        date = DateUtils.getDateInZone(date, zone);
        let yourLocale = Intl.NumberFormat().resolvedOptions().locale;
        let yourTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        let yourTime = Intl.DateTimeFormat(yourLocale, {
            dateStyle: "short",
            timeStyle: 'short',
            timeZone: yourTimeZone
        }).format(date);

        let theirTime = Intl.DateTimeFormat(yourLocale, {
            dateStyle: "short",
            timeStyle: 'short',
            timeZone: zone
        }).format(date);

        return {
            until: DateUtils.msToTime(date.getTime() - new Date().getTime()),
            your: {zone: yourTimeZone, time: yourTime},
            their: {zone: zone, time: theirTime}
        };
    }

}