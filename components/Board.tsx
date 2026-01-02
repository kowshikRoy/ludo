"use client";
import React from 'react';
import { PlayerColor, Coord, BASE_POS } from '@/lib/ludoConstants';
import { PawnState } from '@/lib/gameLogic';
import Pawn from './Pawn';
import Dice from './Dice';

import { generateAvatarGradient, generateInitials } from '@/lib/avatarUtils';

interface PlayerInfo {
  name: string;
  color: PlayerColor;
}

interface BoardProps {
  diceValue: number;
  rolling: boolean;
  turn: PlayerColor;
  pawns: PawnState[];
  onRoll: () => void;
  onPawnClick: (id: number) => void;
  highlightPawn?: number | null;
  players: PlayerInfo[];
  activeColors: PlayerColor[];
}

const Board: React.FC<BoardProps> = ({ diceValue, rolling, turn, pawns, onRoll, onPawnClick, players, activeColors }) => {

  const renderPawnsAt = (r: number, c: number) => {
    const here = pawns.filter(p => {
      if (p.pos === 'base') {
        const baseCoords = BASE_POS[p.color];
        const localIdx = p.id % 4;
        return baseCoords[localIdx].r === r && baseCoords[localIdx].c === c;
      }
      if (p.pos === 'home') return false;
      return (p.pos as Coord).r === r && (p.pos as Coord).c === c;
    });

    if (here.length === 0) return null;

    // Handle multiple pawns (stacking/scaling)
    const scale = here.length > 1 ? 0.7 : 1;

    return (
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: here.length > 1 ? '1fr 1fr' : '1fr',
        placeItems: 'center',
        zIndex: 10
      }}>
        {here.map(p => {
          const isInactive = !activeColors.includes(p.color);
          return (
            <div
              key={p.id}
              style={{ transform: `scale(${scale})`, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              className={isInactive ? 'inactive' : ''}
            >
              <Pawn color={p.color} onClick={() => onPawnClick(p.id)} />
            </div>
          );
        })}
      </div>
    );
  };

  const renderArmCells = (
    startRow: number, startCol: number,
    rows: number, cols: number,
    pathCheck: (r: number, c: number) => { cls?: string; icon?: string }
  ) => {
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const globalR = startRow + r;
        const globalC = startCol + c;
        const { cls = '', icon } = pathCheck(r, c);
        
        cells.push(
          <div key={`${globalR}-${globalC}`} className={`cell ${cls}`}>
            {icon && <span className="material-symbols-outlined text-white/50 text-lg">{icon}</span>}
            {renderPawnsAt(globalR, globalC)}
          </div>
        );
      }
    }
    return cells;
  };

  // ... (renderPlayerHud kept as is, but it's outside this block usually, checking original file structure)
  // Wait, I am replacing lines 71 to 265 roughly? 
  // The original has renderPawnsAt at l29. 
  // I need to be careful with the range.
  // The original renderArmCells was lines 71-90.
  // The usages were 195-207, 210-228, 231-247, 250-265.
  // I'll replace the whole blocks.

  // Re-implementing renderArmCells higher up or just using the one I have.
  // Actually, I will replace the whole return statement of the component to include the updated logic inline or keep `renderArmCells` helper updated.
  
  // Let's replace the helper definition FIRST (lines 71-90)
  /* I will use multiple ReplaceFileContent or one big one? 
     The tool definition says "ReplaceFileContent" is for SINGLE contiguous block. 
     "MultiReplaceFileContent" is for multiple.
     I should use MultiReplaceFileContent since I need to change definition AND usage.
  */


  const renderPlayerHud = (color: PlayerColor) => {
    const isMyTurn = turn === color;
    const playerInfo = players.find(p => p.color === color);
    const isActive = activeColors.includes(color);

    // Always render the HUD, even if player hasn't joined
    const isEmpty = !playerInfo;
    const initials = isEmpty ? '?' : generateInitials(playerInfo.name);
    const gradient = isEmpty
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
      : generateAvatarGradient(playerInfo.name, color);
    const displayName = isEmpty ? 'Waiting...' : playerInfo.name;

    return (
      <div
        className={`player-hud ${color} ${isMyTurn ? 'active-turn' : ''} ${isEmpty ? 'empty' : ''} ${!isActive && !isEmpty ? 'inactive' : ''}`}
        style={{
          '--glow-color': isMyTurn ? `var(--color-${color})` : 'transparent'
        } as React.CSSProperties}
      >
        <div className="avatar-container relative">
          <div className="avatar" style={{ background: gradient }}>
            {initials}
          </div>
          {isMyTurn && !isEmpty && (
            <div className="absolute inset-[-10px] rounded-full blur-xl opacity-50 z-[-1] animate-pulse"
              style={{ backgroundColor: `var(--color-${color})` }} />
          )}
        </div>
        <div className="player-name-container flex flex-col items-center gap-1">
          <div className="player-name">{displayName}</div>
          {isMyTurn && <div className="text-[10px] uppercase font-black tracking-tighter text-white/40">Active Now</div>}
        </div>
        {isMyTurn && !isEmpty && (
          <div className="mt-2 transform scale-110">
            <Dice value={diceValue} rolling={rolling} onRoll={onRoll} color={color} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='game-container'>

      {/* Player HUDs positioned around the container */}
      {renderPlayerHud('blue')}
      {renderPlayerHud('yellow')}
      {renderPlayerHud('red')}
      {renderPlayerHud('green')}

      <div className="board">
        {/* Bases: Blue(TL), Yellow(TR), Green(BR), Red(BL) */}
        <div className="base blue">
          <div className="base-inner">
            {activeColors.includes('blue') && (
              <>
                <div className="base-spot" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{renderPawnsAt(1, 1)}</div>
                <div className="base-spot" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{renderPawnsAt(1, 4)}</div>
                <div className="base-spot" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{renderPawnsAt(4, 1)}</div>
                <div className="base-spot" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{renderPawnsAt(4, 4)}</div>
              </>
            )}
          </div>
        </div>
        <div className="base yellow">
          <div className="base-inner">
            {activeColors.includes('yellow') && (
              <>
                <div className="base-spot" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{renderPawnsAt(1, 10)}</div>
                <div className="base-spot" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{renderPawnsAt(1, 13)}</div>
                <div className="base-spot" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{renderPawnsAt(4, 10)}</div>
                <div className="base-spot" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{renderPawnsAt(4, 13)}</div>
              </>
            )}
          </div>
        </div>
        <div className="base green">
          <div className="base-inner">
            {activeColors.includes('green') && (
              <>
                <div className="base-spot" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{renderPawnsAt(10, 10)}</div>
                <div className="base-spot" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{renderPawnsAt(10, 13)}</div>
                <div className="base-spot" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{renderPawnsAt(13, 10)}</div>
                <div className="base-spot" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{renderPawnsAt(13, 13)}</div>
              </>
            )}
          </div>
        </div>
        <div className="base red">
          <div className="base-inner">
            {activeColors.includes('red') && (
              <>
                <div className="base-spot" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{renderPawnsAt(10, 1)}</div>
                <div className="base-spot" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{renderPawnsAt(10, 4)}</div>
                <div className="base-spot" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{renderPawnsAt(13, 1)}</div>
                <div className="base-spot" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{renderPawnsAt(13, 4)}</div>
              </>
            )}
          </div>
        </div>

        {/* Top Arm (Yellow Home) */}
        <div className="arm top">
          {renderArmCells(0, 6, 6, 3, (r, c) => {
            // Yellow Home Path: Col 1.
            // r=5 is closest to center. r=0 is furthest.
            // We want 5 colored squares. r=1..5.
            if (c === 1 && r > 0) return { cls: 'bg-ludo-yellow' };
            // Yellow Start Safe: Row 1, Col 2 (8,1 global) -> Arrow Down
            if (r === 1 && c === 2) return { cls: 'bg-ludo-yellow', icon: 'arrow_downward' };
            // Safe Star: 6,2 global -> Top Arm (r=2, c=0)
            if (r === 2 && c === 0) return { icon: 'star' };
            return {};
          })}
        </div>

        {/* Bottom Arm (Red Home) */}
        <div className="arm bottom">
          {renderArmCells(9, 6, 6, 3, (r, c) => {
            // Red Home Path:
            // r=0 is closest to center. r=5 is furthest (entry).
            // We want 5 colored squares leading to center. So r=0..4.
            if (c === 1 && r < 5) return { cls: 'bg-ludo-red' };

            // Red Start (13,6): r=4, c=0 -> Arrow Up
            if (r === 4 && c === 0) return { cls: 'bg-ludo-red', icon: 'arrow_upward' };

            // Safe Star: (12,8) -- wait ludo-meet: 8,12 (Bottom Wing Star).
            // Wait, ludo-meet Coords (x,y). (8,12) -> Col 8, Row 12.
            // Col 8 is Middle of Bottom Arm (c=2). Row 12 is r=3.
            // So r=3, c=2 is Safe.
            if (r === 3 && c === 2) return { icon: 'star' };

            return {};
          })}
        </div>

        {/* Left Arm (Blue Home) */}
        <div className="arm left">
          {renderArmCells(6, 0, 3, 6, (r, c) => {
            // Blue Home Path: Row 1, Cols 1-5.
            if (r === 1 && c > 0) return { cls: 'bg-ludo-blue' };

            // Blue Start: (1,6). Row 6, Col 1. (6,1 global).
            // r=0, c=1 -> Arrow Right
            if (r === 0 && c === 1) return { cls: 'bg-ludo-blue', icon: 'arrow_forward' };

            // Safe Star: (2,8)? No. ludo-meet: 2,8 (Left Wing Star)
            // x=2, y=8. Col 2, Row 8.
            // Row 8 is Middle (r=2). Col 2 is c=2.
            if (r === 2 && c === 2) return { icon: 'star' };

            return {};
          })}
        </div>

        {/* Right Arm (Green Home) */}
        <div className="arm right">
          {renderArmCells(6, 9, 3, 6, (r, c) => {
            // Green Home Path: Row 1, Cols 0-4.
            if (r === 1 && c < 5) return { cls: 'bg-ludo-green' };

            // Green Start (8,13): r=2, c=4 -> Arrow Left
            if (r === 2 && c === 4) return { cls: 'bg-ludo-green', icon: 'arrow_back' };

            // Safe Star: ludo-meet 12,6 (Right Wing).
            // x=12, y=6. Col 12, Row 6.
            // Row 6 is Top Row (r=0). Col 12 is c=3.
            if (r === 0 && c === 3) return { icon: 'star' };

            return {};
          })}
        </div>

        {/* Center Home */}
        <div className="center-home">
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block' }}>
            {/* Left: Blue. Top: Yellow. Right: Green. Bottom: Red. */}
            <polygon points="0,0 50,50 0,100" fill="var(--color-ludo-blue)" />
            <polygon points="0,0 100,0 50,50" fill="var(--color-ludo-yellow)" />
            <polygon points="100,0 100,100 50,50" fill="var(--color-ludo-green)" />
            <polygon points="0,100 100,100 50,50" fill="var(--color-ludo-red)" />
          </svg>
          {/* Center Pawns */}
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
            {pawns.filter(p => p.pos === 'home').length > 0 && (
              <div style={{ backgroundColor: 'white', padding: '5px', borderRadius: '5px' }}>
                {pawns.filter(p => p.pos === 'home').length}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Board;
