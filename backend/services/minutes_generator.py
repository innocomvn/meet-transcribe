"""
Meeting minutes generator service
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
import markdown

from database import Meeting, Transcript
from config import settings

logger = logging.getLogger(__name__)


class MinutesGenerator:
    """Generate meeting minutes from transcripts"""

    def __init__(self):
        self.output_dir = os.path.join(settings.UPLOAD_DIR, "minutes")
        os.makedirs(self.output_dir, exist_ok=True)

    async def generate(
        self,
        meeting: Meeting,
        transcripts: List[Transcript],
        format: str = "pdf"
    ) -> Dict[str, Any]:
        """
        Generate meeting minutes

        Args:
            meeting: Meeting object
            transcripts: List of transcript objects
            format: Output format (pdf, docx, md)

        Returns:
            Dictionary with minutes data and file path
        """
        logger.info(f"Generating minutes for meeting {meeting.id} in format {format}")

        # Analyze transcripts to extract key information
        analysis = self._analyze_transcripts(transcripts)

        # Create summary
        summary = self._create_summary(meeting, transcripts, analysis)

        # Generate file based on format
        file_path = None
        if format == "pdf":
            file_path = await self._generate_pdf(meeting, summary, analysis)
        elif format == "docx":
            file_path = await self._generate_docx(meeting, summary, analysis)
        elif format == "md":
            file_path = await self._generate_markdown(meeting, summary, analysis)

        return {
            "summary": summary,
            "key_points": analysis.get("key_points", []),
            "action_items": analysis.get("action_items", []),
            "decisions": analysis.get("decisions", []),
            "participants": analysis.get("participants", {}),
            "file_path": file_path
        }

    def _analyze_transcripts(self, transcripts: List[Transcript]) -> Dict[str, Any]:
        """Analyze transcripts to extract key information"""

        # Extract speakers
        speakers = set()
        for t in transcripts:
            if t.speaker:
                speakers.add(t.speaker)

        # Simple keyword-based extraction
        key_points = []
        action_items = []
        decisions = []

        action_keywords = ["cần", "phải", "sẽ", "hãy", "làm", "thực hiện", "action", "todo", "task"]
        decision_keywords = ["quyết định", "chọn", "đồng ý", "chấp nhận", "decide", "decision", "agree"]
        important_keywords = ["quan trọng", "chính", "chú ý", "nhấn mạnh", "important", "key", "main"]

        for t in transcripts:
            text_lower = t.text.lower()

            # Check for action items
            if any(keyword in text_lower for keyword in action_keywords):
                action_items.append({
                    "text": t.text,
                    "speaker": t.speaker,
                    "timestamp": t.timestamp.isoformat()
                })

            # Check for decisions
            elif any(keyword in text_lower for keyword in decision_keywords):
                decisions.append({
                    "text": t.text,
                    "speaker": t.speaker,
                    "timestamp": t.timestamp.isoformat()
                })

            # Check for key points
            elif any(keyword in text_lower for keyword in important_keywords):
                key_points.append({
                    "text": t.text,
                    "speaker": t.speaker,
                    "timestamp": t.timestamp.isoformat()
                })

        return {
            "speakers": list(speakers),
            "key_points": key_points[:10],  # Top 10
            "action_items": action_items,
            "decisions": decisions,
            "participants": {
                "count": len(speakers),
                "names": list(speakers)
            }
        }

    def _create_summary(
        self,
        meeting: Meeting,
        transcripts: List[Transcript],
        analysis: Dict[str, Any]
    ) -> str:
        """Create a summary of the meeting"""

        duration = "N/A"
        if meeting.end_time and meeting.start_time:
            delta = meeting.end_time - meeting.start_time
            hours = delta.seconds // 3600
            minutes = (delta.seconds % 3600) // 60
            duration = f"{hours}h {minutes}m" if hours > 0 else f"{minutes}m"

        summary = f"""
Cuộc họp "{meeting.title}" diễn ra vào {meeting.start_time.strftime('%d/%m/%Y lúc %H:%M')}.
Cuộc họp kéo dài {duration} với sự tham gia của {analysis['participants']['count']} người.

Trong cuộc họp, có {len(analysis['key_points'])} điểm chính được thảo luận,
{len(analysis['decisions'])} quyết định được đưa ra, và {len(analysis['action_items'])} nhiệm vụ cần thực hiện.
        """.strip()

        return summary

    async def _generate_pdf(
        self,
        meeting: Meeting,
        summary: str,
        analysis: Dict[str, Any]
    ) -> str:
        """Generate PDF meeting minutes"""

        filename = f"minutes_{meeting.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
        file_path = os.path.join(self.output_dir, filename)

        doc = SimpleDocTemplate(file_path, pagesize=A4)
        story = []
        styles = getSampleStyleSheet()

        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30,
            alignment=1  # Center
        )
        story.append(Paragraph("BIÊN BẢN CUỘC HỌP", title_style))
        story.append(Spacer(1, 0.2 * inch))

        # Meeting info
        info_data = [
            ["Tiêu đề:", meeting.title],
            ["Chủ trì:", meeting.host_name],
            ["Thời gian:", meeting.start_time.strftime('%d/%m/%Y %H:%M')],
            ["Số người tham gia:", str(analysis['participants']['count'])]
        ]

        info_table = Table(info_data, colWidths=[2*inch, 4*inch])
        info_table.setStyle(TableStyle([
            ('FONT', (0, 0), (-1, -1), 'Helvetica', 10),
            ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 10),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0'))
        ]))
        story.append(info_table)
        story.append(Spacer(1, 0.3 * inch))

        # Summary
        story.append(Paragraph("<b>TÓM TẮT:</b>", styles['Heading2']))
        story.append(Paragraph(summary, styles['Normal']))
        story.append(Spacer(1, 0.2 * inch))

        # Key points
        if analysis['key_points']:
            story.append(Paragraph("<b>ĐIỂM CHÍNH:</b>", styles['Heading2']))
            for idx, point in enumerate(analysis['key_points'], 1):
                story.append(Paragraph(f"{idx}. {point['text']}", styles['Normal']))
            story.append(Spacer(1, 0.2 * inch))

        # Decisions
        if analysis['decisions']:
            story.append(Paragraph("<b>QUYẾT ĐỊNH:</b>", styles['Heading2']))
            for idx, decision in enumerate(analysis['decisions'], 1):
                story.append(Paragraph(f"{idx}. {decision['text']}", styles['Normal']))
            story.append(Spacer(1, 0.2 * inch))

        # Action items
        if analysis['action_items']:
            story.append(Paragraph("<b>NHIỆM VỤ CẦN THỰC HIỆN:</b>", styles['Heading2']))
            for idx, item in enumerate(analysis['action_items'], 1):
                story.append(Paragraph(f"{idx}. {item['text']}", styles['Normal']))

        doc.build(story)
        logger.info(f"PDF minutes generated: {file_path}")
        return file_path

    async def _generate_docx(
        self,
        meeting: Meeting,
        summary: str,
        analysis: Dict[str, Any]
    ) -> str:
        """Generate DOCX meeting minutes"""

        filename = f"minutes_{meeting.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.docx"
        file_path = os.path.join(self.output_dir, filename)

        doc = Document()

        # Title
        title = doc.add_heading('BIÊN BẢN CUỘC HỌP', 0)
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER

        # Meeting info
        doc.add_heading('Thông tin cuộc họp', 2)
        table = doc.add_table(rows=4, cols=2)
        table.style = 'Light Grid Accent 1'

        table.rows[0].cells[0].text = 'Tiêu đề:'
        table.rows[0].cells[1].text = meeting.title
        table.rows[1].cells[0].text = 'Chủ trì:'
        table.rows[1].cells[1].text = meeting.host_name
        table.rows[2].cells[0].text = 'Thời gian:'
        table.rows[2].cells[1].text = meeting.start_time.strftime('%d/%m/%Y %H:%M')
        table.rows[3].cells[0].text = 'Số người tham gia:'
        table.rows[3].cells[1].text = str(analysis['participants']['count'])

        # Summary
        doc.add_heading('Tóm tắt', 2)
        doc.add_paragraph(summary)

        # Key points
        if analysis['key_points']:
            doc.add_heading('Điểm chính', 2)
            for point in analysis['key_points']:
                doc.add_paragraph(point['text'], style='List Bullet')

        # Decisions
        if analysis['decisions']:
            doc.add_heading('Quyết định', 2)
            for decision in analysis['decisions']:
                doc.add_paragraph(decision['text'], style='List Bullet')

        # Action items
        if analysis['action_items']:
            doc.add_heading('Nhiệm vụ cần thực hiện', 2)
            for item in analysis['action_items']:
                doc.add_paragraph(item['text'], style='List Bullet')

        doc.save(file_path)
        logger.info(f"DOCX minutes generated: {file_path}")
        return file_path

    async def _generate_markdown(
        self,
        meeting: Meeting,
        summary: str,
        analysis: Dict[str, Any]
    ) -> str:
        """Generate Markdown meeting minutes"""

        filename = f"minutes_{meeting.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.md"
        file_path = os.path.join(self.output_dir, filename)

        content = f"""# BIÊN BẢN CUỘC HỌP

## Thông tin cuộc họp

- **Tiêu đề:** {meeting.title}
- **Chủ trì:** {meeting.host_name}
- **Thời gian:** {meeting.start_time.strftime('%d/%m/%Y %H:%M')}
- **Số người tham gia:** {analysis['participants']['count']}

## Tóm tắt

{summary}

"""

        # Key points
        if analysis['key_points']:
            content += "## Điểm chính\n\n"
            for idx, point in enumerate(analysis['key_points'], 1):
                content += f"{idx}. {point['text']}\n"
            content += "\n"

        # Decisions
        if analysis['decisions']:
            content += "## Quyết định\n\n"
            for idx, decision in enumerate(analysis['decisions'], 1):
                content += f"{idx}. {decision['text']}\n"
            content += "\n"

        # Action items
        if analysis['action_items']:
            content += "## Nhiệm vụ cần thực hiện\n\n"
            for idx, item in enumerate(analysis['action_items'], 1):
                content += f"{idx}. {item['text']}\n"

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        logger.info(f"Markdown minutes generated: {file_path}")
        return file_path
