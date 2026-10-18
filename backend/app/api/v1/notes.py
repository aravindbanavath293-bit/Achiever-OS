from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.note import StickyNote
from app.models.user import User
from app.schemas.note import StickyNoteCreate, StickyNoteUpdate, StickyNoteOut
from app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=List[StickyNoteOut])
def get_notes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(StickyNote).filter(StickyNote.user_id == current_user.id).order_by(StickyNote.is_pinned.desc(), StickyNote.updated_at.desc()).all()

@router.post("", response_model=StickyNoteOut, status_code=status.HTTP_201_CREATED)
def create_note(note_in: StickyNoteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    note = StickyNote(
        user_id=current_user.id,
        **note_in.dict()
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.get("/{note_id}", response_model=StickyNoteOut)
def get_note(note_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    note = db.query(StickyNote).filter(StickyNote.id == note_id, StickyNote.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.patch("/{note_id}", response_model=StickyNoteOut)
def update_note(note_id: str, note_in: StickyNoteUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    note = db.query(StickyNote).filter(StickyNote.id == note_id, StickyNote.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    update_data = note_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(note, field, val)

    db.commit()
    db.refresh(note)
    return note

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    note = db.query(StickyNote).filter(StickyNote.id == note_id, StickyNote.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()
    return None
