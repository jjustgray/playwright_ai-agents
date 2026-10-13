# Valtive Calendly — Booking Test Plan

## Application Overview

This plan is based on exploring the Calendly widget at https://valtive.io/contact-valtive/ (the “Request a free consultation” link on the home page leads to this route). The widget is named “30 Minute Meeting,” and its duration is 30 minutes; the timezone shown during exploration was Eastern European Time. The calendar was checked on October 13, 2026, and availability was found in October. Scenarios B01–B40 list 40 distinct date/time pairs observed in the calendar: October 14 (14 slots), October 15 (16), and October 16 (10). Availability changes in real time: verify each slot against the current calendar before running; if it is already booked or unavailable, replace it with another available, unique slot while keeping 40 distinct pairs. Do not treat dynamic unavailability as a defect. Each B-series scenario is independent: start with a clean session or fresh widget state, use synthetic test data for one controlled inbox (with a unique alias or identifier per scenario), and choose a unique slot. A successful booking creates an invitation. Run bookings only in an approved test environment or test calendar with a controlled inbox, and plan to remove test events after verification. For each successful booking, assert the exact text “You are scheduled” and “A calendar invitation has been sent to your email address.” Also verify that the selected date, time, and email match the submitted form and event. Do not use personal data. Additional scenarios cover the calendar, validation, and timezone without creating real bookings. Seed: `tests\seed.spec.ts`.

## Test Scenarios

### 1. Primary Flow: 40 Unique Calendly Bookings

**Seed:** `tests\seed.spec.ts`

#### 1.1. B01 — Booking 14 October 2026, 10:00 EET

**File:** `tests\valtive-booking\booking-01.spec.ts`

**Steps:**
  1. In a fresh state, open https://valtive.io/contact-valtive/ and wait for the Calendly “30 Minute Meeting” iframe to load.
    - expect: The widget displays date and time selection, and the meeting duration is 30 minutes.
  2. Select Wednesday, October 14, 2026, then choose the available slot 10:00. Verify the selected time is 10:00–10:30 and the timezone is Eastern European Time.
    - expect: The confirmation form shows Wednesday, October 14, 2026, 10:00–10:30 and the correct timezone.
  3. Fill in the required First name, Last name, and Email fields with synthetic data for scenario B01; click Schedule Event.
    - expect: The exact text “You are scheduled” is displayed.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is displayed.
    - expect: The confirmed event matches slot B01 and email B01.

#### 1.2. B02 — Booking 14 October 2026, 10:30 EET

**File:** `tests\valtive-booking\booking-02.spec.ts`

**Steps:**
  1. In a fresh state, open https://valtive.io/contact-valtive/ and wait for the Calendly “30 Minute Meeting” iframe to load.
    - expect: The widget displays date and time selection, and the meeting duration is 30 minutes.
  2. Select Wednesday, October 14, 2026, then choose the available slot 10:30. Verify the selected time is 10:30–11:00 and the timezone is Eastern European Time.
    - expect: The confirmation form shows Wednesday, October 14, 2026, 10:30–11:00 and the correct timezone.
  3. Fill in the required fields with synthetic data for scenario B02; click Schedule Event.
    - expect: The exact text “You are scheduled” is displayed.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is displayed.
    - expect: The confirmed event matches slot B02 and email B02.

#### 1.3. B03 — Booking 14 October 2026, 11:00 EET

**File:** `tests\valtive-booking\booking-03.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Wednesday, October 14, 2026, 11:00; verify the 30-minute interval 11:00–11:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic first name, last name, and email for B03 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B03 and email address B03.

#### 1.4. B04 — Booking 14 October 2026, 11:30 EET

**File:** `tests\valtive-booking\booking-04.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Wednesday, October 14, 2026, 11:30; verify the interval 11:30–12:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B04 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B04 and email B04.

#### 1.5. B05 — Booking 14 October 2026, 12:00 EET

**File:** `tests\valtive-booking\booking-05.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Wednesday, October 14, 2026, 12:00; verify the interval 12:00–12:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B05 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B05 and email B05.

#### 1.6. B06 — Booking 14 October 2026, 12:30 EET

**File:** `tests\valtive-booking\booking-06.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Wednesday, October 14, 2026, 12:30; verify the interval 12:30–13:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B06 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B06 and email B06.

#### 1.7. B07 — Booking 14 October 2026, 14:00 EET

**File:** `tests\valtive-booking\booking-07.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Wednesday, October 14, 2026, 14:00; verify the interval 14:00–14:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B07 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B07 and email B07.

#### 1.8. B08 — Booking 14 October 2026, 14:30 EET

**File:** `tests\valtive-booking\booking-08.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Wednesday, October 14, 2026, 14:30; verify the interval 14:30–15:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B08 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B08 and email B08.

#### 1.9. B09 — Booking 14 October 2026, 15:00 EET

**File:** `tests\valtive-booking\booking-09.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Wednesday, October 14, 2026, 15:00; verify the interval 15:00–15:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B09 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B09 and email B09.

#### 1.10. B10 — Booking 14 October 2026, 15:30 EET

**File:** `tests\valtive-booking\booking-10.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Wednesday, October 14, 2026, 15:30; verify the interval 15:30–16:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B10 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B10 and email B10.

#### 1.11. B11 — Booking 14 October 2026, 21:00 EET

**File:** `tests\valtive-booking\booking-11.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Wednesday, October 14, 2026, 21:00; verify the interval 21:00–21:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B11 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B11 and email B11.

#### 1.12. B12 — Booking 14 October 2026, 21:30 EET

**File:** `tests\valtive-booking\booking-12.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Wednesday, October 14, 2026, 21:30; verify the interval 21:30–22:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B12 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B12 and email B12.

#### 1.13. B13 — Booking 14 October 2026, 22:00 EET

**File:** `tests\valtive-booking\booking-13.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Wednesday, October 14, 2026, 22:00; verify the interval 22:00–22:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B13 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B13 and email B13.

#### 1.14. B14 — Booking 14 October 2026, 22:30 EET

**File:** `tests\valtive-booking\booking-14.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Wednesday, October 14, 2026, 22:30; verify the interval 22:30–23:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B14 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B14 and email B14.

#### 1.15. B15 — Booking 15 October 2026, 10:00 EET

**File:** `tests\valtive-booking\booking-15.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Thursday, October 15, 2026, 10:00; verify the interval 10:00–10:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B15 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B15 and email B15.

#### 1.16. B16 — Booking 15 October 2026, 10:30 EET

**File:** `tests\valtive-booking\booking-16.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Thursday, October 15, 2026, 10:30; verify the interval 10:30–11:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B16 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B16 and email B16.

#### 1.17. B17 — Booking 15 October 2026, 11:00 EET

**File:** `tests\valtive-booking\booking-17.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Thursday, October 15, 2026, 11:00; verify the interval 11:00–11:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B17 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B17 and email B17.

#### 1.18. B18 — Booking 15 October 2026, 11:30 EET

**File:** `tests\valtive-booking\booking-18.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Thursday, October 15, 2026, 11:30; verify the interval 11:30–12:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B18 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B18 and email B18.

#### 1.19. B19 — Booking 15 October 2026, 12:00 EET

**File:** `tests\valtive-booking\booking-19.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Thursday, October 15, 2026, 12:00; verify the interval 12:00–12:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B19 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B19 and email B19.

#### 1.20. B20 — Booking 15 October 2026, 12:30 EET

**File:** `tests\valtive-booking\booking-20.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Thursday, October 15, 2026, 12:30; verify the interval 12:30–13:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B20 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B20 and email B20.

#### 1.21. B21 — Booking 15 October 2026, 13:00 EET

**File:** `tests\valtive-booking\booking-21.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Thursday, October 15, 2026, 13:00; verify the interval 13:00–13:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B21 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B21 and email B21.

#### 1.22. B22 — Booking 15 October 2026, 13:30 EET

**File:** `tests\valtive-booking\booking-22.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Thursday, October 15, 2026, 13:30; verify the interval 13:30–14:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B22 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B22 and email B22.

#### 1.23. B23 — Booking 15 October 2026, 14:00 EET

**File:** `tests\valtive-booking\booking-23.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Thursday, October 15, 2026, 14:00; verify the interval 14:00–14:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B23 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B23 and email B23.

#### 1.24. B24 — Booking 15 October 2026, 14:30 EET

**File:** `tests\valtive-booking\booking-24.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Thursday, October 15, 2026, 14:30; verify the interval 14:30–15:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B24 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B24 and email B24.

#### 1.25. B25 — Booking 15 October 2026, 21:00 EET

**File:** `tests\valtive-booking\booking-25.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Thursday, October 15, 2026, 21:00; verify the interval 21:00–21:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B25 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B25 and email B25.

#### 1.26. B26 — Booking 15 October 2026, 21:30 EET

**File:** `tests\valtive-booking\booking-26.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Thursday, October 15, 2026, 21:30; verify the interval 21:30–22:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B26 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B26 and email B26.

#### 1.27. B27 — Booking 15 October 2026, 22:00 EET

**File:** `tests\valtive-booking\booking-27.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Thursday, October 15, 2026, 22:00; verify the interval 22:00–22:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B27 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B27 and email B27.

#### 1.28. B28 — Booking 15 October 2026, 22:30 EET

**File:** `tests\valtive-booking\booking-28.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Thursday, October 15, 2026, 22:30; verify the interval 22:30–23:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B28 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B28 and email B28.

#### 1.29. B29 — Booking 15 October 2026, 23:00 EET

**File:** `tests\valtive-booking\booking-29.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Thursday, October 15, 2026, 23:00; verify the interval 23:00–23:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B29 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B29 and email B29.

#### 1.30. B30 — Booking 15 October 2026, 23:30 EET

**File:** `tests\valtive-booking\booking-30.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Thursday, October 15, 2026, 23:30; verify the interval 23:30–00:00 on the following day and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone; the end time correctly rolls over to the following day.
  3. Enter the required synthetic data for B30 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B30 and email B30.

#### 1.31. B31 — Booking 16 October 2026, 10:00 EET

**File:** `tests\valtive-booking\booking-31.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Friday, October 16, 2026, 10:00; verify the interval 10:00–10:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B31 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B31 and email B31.

#### 1.32. B32 — Booking 16 October 2026, 10:30 EET

**File:** `tests\valtive-booking\booking-32.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Friday, October 16, 2026, 10:30; verify the interval 10:30–11:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B32 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B32 and email B32.

#### 1.33. B33 — Booking 16 October 2026, 11:00 EET

**File:** `tests\valtive-booking\booking-33.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Friday, October 16, 2026, 11:00; verify the interval 11:00–11:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B33 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B33 and email B33.

#### 1.34. B34 — Booking 16 October 2026, 11:30 EET

**File:** `tests\valtive-booking\booking-34.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Friday, October 16, 2026, 11:30; verify the interval 11:30–12:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B34 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B34 and email B34.

#### 1.35. B35 — Booking 16 October 2026, 12:00 EET

**File:** `tests\valtive-booking\booking-35.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Friday, October 16, 2026, 12:00; verify the interval 12:00–12:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B35 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B35 and email B35.

#### 1.36. B36 — Booking 16 October 2026, 12:30 EET

**File:** `tests\valtive-booking\booking-36.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Friday, October 16, 2026, 12:30; verify the interval 12:30–13:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B36 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B36 and email B36.

#### 1.37. B37 — Booking 16 October 2026, 13:00 EET

**File:** `tests\valtive-booking\booking-37.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Friday, October 16, 2026, 13:00; verify the interval 13:00–13:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B37 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B37 and email B37.

#### 1.38. B38 — Booking 16 October 2026, 13:30 EET

**File:** `tests\valtive-booking\booking-38.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Friday, October 16, 2026, 13:30; verify the interval 13:30–14:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B38 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B38 and email B38.

#### 1.39. B39 — Booking 16 October 2026, 14:00 EET

**File:** `tests\valtive-booking\booking-39.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Friday, October 16, 2026, 14:00; verify the interval 14:00–14:30 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B39 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B39 and email B39.

#### 1.40. B40 — Booking 16 October 2026, 14:30 EET

**File:** `tests\valtive-booking\booking-40.spec.ts`

**Steps:**
  1. In a fresh state, open the Valtive contact page and wait for the Calendly widget to be ready.
    - expect: The “30 Minute Meeting” widget is loaded.
  2. Select Friday, October 16, 2026, 14:30; verify the interval 14:30–15:00 and the EET timezone.
    - expect: The details form shows the selected date, time interval, and timezone.
  3. Enter the required synthetic data for B40 and click Schedule Event.
    - expect: The exact text “You are scheduled” is visible.
    - expect: The exact text “A calendar invitation has been sent to your email address.” is visible.
    - expect: The booking confirms slot B40 and email B40.

### 2. Validation, Calendar, and Timezone Settings

**Seed:** `tests\seed.spec.ts`

#### 2.1. Do Not Submit the Booking Form Without Required Information

**File:** `tests\valtive-booking\validation-empty.spec.ts`

**Steps:**
  1. In a fresh state, open the contact page, select an available date and time, and click Schedule Event while leaving First name, Last name, and Email empty.
    - expect: No booking is created and no invitation is sent.
    - expect: A required-field validation error is shown for each required field (the observed widget text was “Can't be blank.”).

#### 2.2. Reject Invalid Email Formats

**File:** `tests\valtive-booking\validation-email.spec.ts`

**Steps:**
  1. Open an available slot, enter a first and last name, provide an invalid email (for example, qa-not-an-email), and click Schedule Event.
    - expect: The form displays an email-format error and does not create an event.
    - expect: Success confirmation messages are not displayed.

#### 2.3. Unavailable Dates Cannot Be Selected

**File:** `tests\valtive-booking\calendar-unavailable-date.spec.ts`

**Steps:**
  1. Open the Calendly calendar and inspect dates with no available times, marked “No times available” (for example, a past date or a date with no availability).
    - expect: The unavailable date has no available time slots and cannot be used to continue to time selection.

#### 2.4. Changing the Timezone Correctly Updates the Slot Time

**File:** `tests\valtive-booking\timezone-display.spec.ts`

**Steps:**
  1. Open an available date and note the selected slot and Eastern European Time timezone. Then open the Time zone selector and choose another supported timezone.
    - expect: The calendar displays the selected timezone, and the local time reflects the timezone conversion for the same meeting.
    - expect: After the change, the displayed slot and confirmation details agree on the date, time, and timezone.
  2. Without clicking Schedule Event, restore the original timezone or end the test without submitting.
    - expect: The test does not create a booking or send an invitation.

#### 2.5. Additional Details and Guests Remain Optional

**File:** `tests\valtive-booking\optional-details.spec.ts`

**Steps:**
  1. Open an available slot, fill in only the required first name, last name, and valid test email, leave the meeting-preparation field empty, and do not add guests.
    - expect: Optional comments and guests are not required to complete the form.
  2. For a safe form check, do not submit; end the test before clicking Schedule Event.
    - expect: No event is created and no invitation is sent.
