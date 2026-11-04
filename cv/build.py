"""Genera el CV en HTML (para el PDF) y en DOCX desde cv.<idioma>.json.

Uso: python3 cv/build.py            → todos los cv.*.json
     python3 cv/build.py cv/cv.es.json
Salida: cv/out/<file>.html y cv/out/<file>.docx (luego `node cv/pdf.cjs` genera los PDF).
"""
import datetime
import html
import json
import sys
from pathlib import Path

from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Mm, Pt, RGBColor

HERE = Path(__file__).parent
OUT = HERE / "out"
e = html.escape

# ------------------------------------------------------------------ HTML → PDF
# Fuente local estática (Carlito, métrica de Calibri): Chrome la incrusta como TrueType,
# no como Type 3, que algunos ATS antiguos (Taleo, iCIMS) no leen bien.
CSS = """
@page { size: A4; margin: 14mm 16mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font-family: Carlito, Calibri, Arial, sans-serif; font-size: 10pt; line-height: 1.33; color: #1b2028; }
a { color: inherit; text-decoration: none; }
h1 { margin: 0; font-size: 22pt; line-height: 1.1; font-weight: 700; color: #111620; }
.headline { margin: 3pt 0 6pt; font-size: 12pt; font-weight: 700; color: #1f4e79; }
.contact { margin: 0; font-size: 9.5pt; color: #3a4350; }
.contact + .contact { margin-top: 1pt; }
.contact span + span::before { content: " | "; color: #9aa3ae; }
h2 { margin: 11pt 0 5pt; padding-bottom: 2pt; border-bottom: 1px solid #c9d1db; font-size: 10.5pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #1f4e79; }
p { margin: 0; }
.entry { margin-bottom: 7pt; }
.entry.short { break-inside: avoid; }
.role { font-size: 11pt; font-weight: 700; color: #111620; }
.meta { font-size: 9.5pt; color: #3a4350; margin-bottom: 2pt; }
.meta b { color: #1b2028; }
.intro, .stack { font-size: 9.5pt; color: #3a4350; margin-bottom: 2pt; }
.stack b { color: #1b2028; }
ul { margin: 2pt 0 0; padding: 0; list-style: none; }
li { margin-bottom: 1.5pt; padding-left: 11pt; text-indent: -8pt; }
li::before { content: "• "; }
.client { margin-top: 4pt; break-inside: avoid; }
.client-title { font-weight: 700; }
.client-title span { font-weight: 400; color: #3a4350; }
.client ul { margin-top: 1pt; }
.project { margin-bottom: 5pt; break-inside: avoid; }
.project-title { font-weight: 700; }
.project-title span { font-weight: 400; color: #3a4350; }
.skills p { margin-bottom: 2pt; }
"""


def meta_line(job: dict) -> str:
    return " | ".join(x for x in [f"<b>{e(job['company'])}</b>", e(job["location"]), e(job["dates"])] if x)


def html_doc(cv: dict) -> str:
    L = cv["labels"]
    out = [
        f"<!doctype html><html lang='{cv['lang'][:2]}'><head><meta charset='utf-8'>",
        f"<title>{e(cv['name'])} - CV</title><style>{CSS}</style></head><body>",
        f"<h1>{e(cv['name'])}</h1><p class='headline'>{e(cv['headline'])}</p>",
    ]
    for line in cv["contact_lines"]:
        out.append(
            "<p class='contact'>"
            + "".join(
                f"<span><a href='{e(c['href'])}'>{e(c['text'])}</a></span>" if c.get("href") else f"<span>{e(c['text'])}</span>"
                for c in line
            )
            + "</p>"
        )
    out += [f"<h2>{e(L['summary'])}</h2>", f"<p>{e(cv['summary'])}</p>", f"<h2>{e(L['experience'])}</h2>"]
    for job in cv["experience"]:
        short = "" if job.get("projects") else " short"
        out.append(f"<div class='entry{short}'><p class='role'>{e(job['role'])}</p><p class='meta'>{meta_line(job)}</p>")
        if job.get("intro"):
            out.append(f"<p class='intro'>{e(job['intro'])}</p>")
        if job.get("stack"):
            out.append(f"<p class='stack'><b>{e(L['stack'])}:</b> {e(job['stack'])}</p>")
        for proj in job.get("projects", []):
            out.append(
                f"<div class='client'><p class='client-title'>{e(L['client'])}: {e(proj['client'])} ({e(proj['dates'])}) "
                f"<span>· {e(proj['area'])}</span></p><ul>"
                + "".join(f"<li>{e(b)}</li>" for b in proj["bullets"])
                + "</ul></div>"
            )
        if job.get("bullets"):
            out.append("<ul>" + "".join(f"<li>{e(b)}</li>" for b in job["bullets"]) + "</ul>")
        out.append("</div>")
    out.append(f"<h2>{e(L['skills'])}</h2><div class='skills'>")
    out += [f"<p><b>{e(s['label'])}:</b> {e(s['items'])}</p>" for s in cv["skills"]]
    out.append("</div>")
    if cv.get("projects"):
        out.append(f"<h2>{e(L['projects'])}</h2>")
        for p in cv["projects"]:
            out.append(
                f"<div class='project'><p class='project-title'>{e(p['name'])} <span>| {e(p['stack'])}</span></p>"
                f"<p>{e(p['text'])}</p></div>"
            )
    out.append(f"<h2>{e(L['education'])}</h2>")
    for ed in cv["education"]:
        out.append(f"<p><b>{e(ed['degree'])}</b> | {e(ed['school'])} | {e(ed['dates'])}</p>")
    out.append(f"<h2>{e(L['languages'])}</h2><p>{e(cv['languages'])}</p></body></html>")
    return "".join(out)


# ------------------------------------------------------------------ DOCX
NAVY = RGBColor(0x1F, 0x4E, 0x79)
MUTED = RGBColor(0x3A, 0x43, 0x50)


def add_bottom_border(paragraph) -> None:
    p_pr = paragraph._p.get_or_add_pPr()
    borders = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    for k, v in {"w:val": "single", "w:sz": "6", "w:space": "1", "w:color": "C9D1DB"}.items():
        bottom.set(qn(k), v)
    borders.append(bottom)
    p_pr.append(borders)


def add_link(paragraph, text: str, url: str) -> None:
    rel = paragraph.part.relate_to(
        url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True
    )
    link = OxmlElement("w:hyperlink")
    link.set(qn("r:id"), rel)
    run = OxmlElement("w:r")
    t = OxmlElement("w:t")
    t.text = text
    run.append(t)
    link.append(run)
    paragraph._p.append(link)


def set_lang(style, lang: str) -> None:
    rpr = style.element.get_or_add_rPr()
    el = OxmlElement("w:lang")
    el.set(qn("w:val"), lang)
    rpr.append(el)


def docx_doc(cv: dict, path: Path) -> None:
    L = cv["labels"]
    doc = Document()
    sec = doc.sections[0]
    sec.page_height, sec.page_width = Mm(297), Mm(210)
    sec.top_margin = sec.bottom_margin = Mm(14)
    sec.left_margin = sec.right_margin = Mm(16)
    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(10)
    normal.paragraph_format.space_after = Pt(0)
    normal.paragraph_format.line_spacing = 1.1
    h1 = doc.styles["Heading 1"]
    h1.font.name = "Calibri"
    h1.font.size = Pt(10.5)
    h1.font.bold = True
    h1.font.color.rgb = NAVY
    for style in (normal, h1, doc.styles["List Bullet"]):
        set_lang(style, cv["lang"])

    def para(text="", size=None, bold=False, color=None, after=0, before=0):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(after)
        p.paragraph_format.space_before = Pt(before)
        if text:
            r = p.add_run(text)
            r.bold = bold
            if size:
                r.font.size = Pt(size)
            if color:
                r.font.color.rgb = color
        return p

    def heading(text):
        p = doc.add_paragraph(style="Heading 1")
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.add_run(text.upper())
        add_bottom_border(p)

    def bullet(text):
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.space_after = Pt(1)
        p.add_run(text)

    def label_line(label, value, before=0):
        p = para(before=before, after=1)
        p.add_run(f"{label}: ").bold = True
        r = p.add_run(value)
        return p, r

    para(cv["name"], 22, True)
    para(cv["headline"], 12, True, NAVY, after=4)
    for line in cv["contact_lines"]:
        p = para()
        for i, c in enumerate(line):
            if i:
                p.add_run(" | ").font.color.rgb = MUTED
            if c.get("href") and not c["href"].startswith("tel:"):
                add_link(p, c["text"], c["href"])
            else:
                p.add_run(c["text"])

    heading(L["summary"])
    para(cv["summary"])
    heading(L["experience"])
    for job in cv["experience"]:
        para(job["role"], 11, True, before=4)
        meta = para(after=2)
        meta.add_run(job["company"]).bold = True
        rest = " | ".join(x for x in [job["location"], job["dates"]] if x)
        meta.add_run(f" | {rest}").font.color.rgb = MUTED
        if job.get("intro"):
            para(job["intro"], color=MUTED, after=2)
        if job.get("stack"):
            label_line(L["stack"], job["stack"])
        for proj in job.get("projects", []):
            t = para(before=3)
            t.add_run(f"{L['client']}: {proj['client']} ({proj['dates']})").bold = True
            t.add_run(f" · {proj['area']}").font.color.rgb = MUTED
            for b in proj["bullets"]:
                bullet(b)
        for b in job.get("bullets", []):
            bullet(b)
    heading(L["skills"])
    for s in cv["skills"]:
        label_line(s["label"], s["items"])
    if cv.get("projects"):
        heading(L["projects"])
        for pj in cv["projects"]:
            t = para(before=2)
            t.add_run(pj["name"]).bold = True
            t.add_run(f" | {pj['stack']}").font.color.rgb = MUTED
            para(pj["text"], after=2)
    heading(L["education"])
    for ed in cv["education"]:
        p = para()
        p.add_run(ed["degree"]).bold = True
        p.add_run(f" | {ed['school']} | {ed['dates']}")
    heading(L["languages"])
    para(cv["languages"])

    now = datetime.datetime.now()
    props = doc.core_properties
    props.title = f"{cv['name']} - CV"
    props.subject = L["subject"]
    props.author = props.last_modified_by = cv["name"]
    props.comments = props.keywords = ""
    props.language = cv["lang"]
    props.created = props.modified = now
    props.revision = 1
    doc.save(path)


def build(source: Path) -> None:
    cv = json.loads(source.read_text(encoding="utf8"))
    OUT.mkdir(exist_ok=True)
    (OUT / f"{cv['file']}.html").write_text(html_doc(cv), encoding="utf8")
    docx_doc(cv, OUT / f"{cv['file']}.docx")
    print(f"ok {source.name} → out/{cv['file']}.html, out/{cv['file']}.docx")


if __name__ == "__main__":
    sources = [Path(a) for a in sys.argv[1:]] or sorted(HERE.glob("cv.*.json"))
    for src in sources:
        build(src)
