# Booking backend setup (about 15 minutes)

Do this signed in as **contact@bearingmind.com**. Everything stays in the practice's own Google account.

1. **Create the Sheet.** Create a new Google Sheet named **BearingMind Bookings**.
2. **Add the script.**
   1. In the Sheet, open **Extensions → Apps Script**.
   2. Delete the sample code and paste in all of `Code.gs`.
   3. Click the gear (**Project Settings**) and tick **Show "appsscript.json" manifest file**.
   4. Open `appsscript.json` in the editor, replace its contents with the `appsscript.json` from this folder, and save.
3. **Run setup once.**
   1. In the function menu at the top, choose **setup** and click **Run**.
   2. Allow the permissions Google asks for (Sheets, Gmail send, Calendar, triggers).
   3. When it finishes, open **Execution log** and copy the long secret it prints. That is `APPS_SCRIPT_SECRET`.

   Setup creates one tab per plan (**Public Figures**, **Employed Professionals**, **Homemakers**, **Children with Parents**) plus **Organisation enquiries**, the Status dropdown and colours, and two automatic triggers: one sends the confirmation when you set Status to Confirmed, and one frees unpaid holds every 10 minutes.
4. **Deploy.**
   1. Click **Deploy → New deployment**, set the type to **Web app**, **Execute as: Me**, and **Who has access: Anyone**.
   2. Click **Deploy** and copy the **Web app URL** (it ends in `/exec`). That is `APPS_SCRIPT_URL`.
5. **Connect the website.** Add both values in Netlify (and `.env.local`), then redeploy.
6. **Optional:** to copy the associate consultant on Children and family bookings, put their email in `ASSOCIATE_EMAIL` at the top of the script.

**After any change to Code.gs:**
1. Click **Deploy → Manage deployments → Edit**.
2. Set **Version** to **New version**, then click **Deploy**.

The URL stays the same. Saving alone does not update the live app.

## Status column

| Status | Meaning | Slot |
| --- | --- | --- |
| Pending payment | Patient is on the payment screen (15 min) | Held |
| Payment to verify | Manual UPI: check the UTR, then set Confirmed | Held |
| Confirmed | Paid. Patient emailed and calendar invite sent | Booked |
| Paid – needs attention | Paid, but the time was taken or the amount differs. Call the patient | Held |
| Completed | Session done (optional, for your records) | Booked |
| Cancelled / Rescheduled | Frees the slot and removes the calendar event | Free |
| Expired | Unpaid hold that ran out | Free |

You can also add a phone or WhatsApp booking by hand. Fill in the row, including Email, Date (YYYY-MM-DD), Start, End and Format code (`meet`, `phone`, `dining` or `inperson`), then set Status to Confirmed. The patient is emailed and invited automatically.

**Never share the Sheet link publicly.** The website only knows the web-app URL and the secret.

## Separate calendars per plan (optional)

Each plan is its own booking system: its own tab, and a time booked in one plan never blocks another. By default all four put events in your main Google Calendar. To keep a plan in its own calendar, create a calendar in Google Calendar (Settings → Add calendar), copy its **Calendar ID** (Settings for that calendar → Integrate calendar), paste it as that plan's `calendar` in `CONFIG.PLANS` at the top of `Code.gs`, then run **setup** again.
