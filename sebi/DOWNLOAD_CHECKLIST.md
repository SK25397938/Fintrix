# SEBI Download Checklist

Use this folder to collect reviewed official SEBI documents for manual ingestion.

## Folders
- `documents/sebi/master_circulars/`
- `documents/sebi/regulations/`
- `documents/sebi/circulars/`

## Workflow
1. Open the official SEBI URL from `manifest.json`.
2. Download the official PDF or save reviewed text locally.
3. Rename the file to the `suggested_file` value.
4. Update `status` in `manifest.json`:
   - `pending_download`
   - `downloaded`
   - `ingested`
5. Run batch ingestion after you have one or more downloaded files.

## Batch ingestion
```bash
python batch_ingest_sebi_documents.py
```

## Single document ingestion
```bash
python ingest_sebi_document.py "documents/sebi/master_circulars/2025-06-17_stock_brokers_master_circular.pdf" "Master Circular for Stock Brokers" "https://www.sebi.gov.in/legal/master-circulars/jun-2025/master-circular-for-stock-brokers_94623.html"
```
