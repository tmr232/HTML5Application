Here we summarize all the globals used in the C code:

# Constants

# Globals
## Decal.c
int PLAYING_TEAMS - number of playing teams
int ACTIVE_FIGHTERS[NB_TEAMS] - number of active fighters per team
int COLOR_FIRST_ENTRY[NB_TEAMS] - ???

## Mesh.c
MESH *CURRENT_MESH - holds the game mesh
int CURRENT_MESH_SIZE - the size of the mesh (width * height)
int CURRENT_AREA_W - width of the mesh
int CURRENT_AREA_H - height of the mesh
BITMAP *CURRENT_AREA_DISP - ???
BITMAP *CURRENT_AREA_BACK - ???

## Cursor.c
CURSOR CURRENT_CURSOR[NB_TEAMS] - cursor information for all teams