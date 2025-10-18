# Integrating Interview Question Banks with Anki

## I. Install and Configure Anki

### Install Anki

Open the [Anki website](https://apps.ankiweb.net/) and install the Anki client.

### Install Add-ons

Open the Anki client and go to Tools > Add-ons.

Click Get Add-ons and enter the following numeric codes one by one, then click OK:
<br>

2055492159: [AnkiConnect](https://ankiweb.net/shared/info/2055492159)
<br>

728482867: [Anki X Markdown X MindMap](https://ankiweb.net/shared/info/728482867)
<br>

2100166052: [Better Markdown Anki](https://ankiweb.net/shared/info/2100166052)
<br>

Restart Anki after all add-ons are installed.

### Configuration

Click File > Import and import the [Anki config package](./anki配置.colpkg) from this project.

## II. Fetch Interview Question Banks

## Flow

```
Frontend bank domain: https://fe.ecool.fun,
Frontend bank list page: https://fe.ecool.fun/topic-list,
Backend bank domain: https://java.mid-life.vip,
Backend bank list page: https://java.mid-life.vip/topic-list
```

<br>
Open the Offer Learning > Integrate Interview Banks and Anki page in the client,
fill in the form and submit, then wait patiently for the import to finish.

## Notes

In the automated browser window that pops up, click the Free tag to import only free questions.
<br>

Otherwise, the import may fail due to not being logged in or not having VIP (about 7–8 CNY per week).
<br>

If you’re logged in and have VIP, in theory you can import any questions you can access—but what are the consequences?
<br>

The author didn’t find a user agreement or a robots.txt governing crawlers on the above sites, so no definitive judgment or recommendation can be given.
<br>

No explicit restriction doesn’t mean no restrictions. For example, using the data for your own learning is likely fine; selling the bank’s data for profit could lead to legal consequences.

## III. Generate Mind Maps for Questions

Generating mind maps with an LLM consumes a lot of tokens. It’s recommended to do it during off-peak discounted hours (00:30–08:30) and ensure sufficient DeepSeek balance.
<br>

Reference costs:

- Daytime: frontend ~9 CNY, backend ~6 CNY
- Discount hours: frontend ~5 CNY, backend ~3 CNY

<br>

Mind map generation is optional, but it greatly helps understanding and memory—recommended!

## IV. Upload the Bank to Anki

Keep Anki open.

Anki needs to be open to access its internal database.
