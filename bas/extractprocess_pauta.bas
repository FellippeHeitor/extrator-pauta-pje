$Debug
'$Include:'.\source\utilities\ini-manager\ini.bi'
Option _Explicit

$ExeIcon:'schedule.ico'
_Icon
_Title "Extrator de processos - Pauta de Audiencias PJe TJMG"
Const true = -1, false = 0
Const q = Chr$(34), lf = Chr$(10)
Const config = "extractprocess_pauta.ini"
Const check = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDQ4IDQ4IiB2ZXJzaW9uPSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDQ4IDQ4Ij4KICAgIDxwb2x5Z29uIGZpbGw9IiM0M0EwNDciIHBvaW50cz0iNDAuNiwxMi4xIDE3LDM1LjcgNy40LDI2LjEgNC42LDI5IDE3LDQxLjMgNDMuNCwxNC45Ii8+Cjwvc3ZnPg=="

Dim filename$, d$, EstaData$, temp$, EstaHora$, p$, found$, l$, converter$, path$, header$
Dim periodo$
Dim As Long choice, k, done, i, checaHora, total, ico
Dim As Single row, col

Screen _NewImage(640, 600, 32)
_ControlChr Off
Color , 0
ico = _LoadImage("schedule.png", 32)
If ico < -1 Then
    _SetAlpha 50, , ico
    _PutImage (_Width / 2 - _Width(ico) / 2, _Height / 2 - _Height(ico) / 2), ico
End If
PCopy 0, 1

startover:
filename$ = _OpenFileDialog$("Selecionar fonte", "", "*.pdf|*.fodg", "Relatorio de pauta do PJe")
If Len(filename$) = 0 Then Print "Aborted.": System
If _FileExists(filename$) = 0 Then Print "File not found.": End

If LCase$(Right$(filename$, 4)) = ".pdf" Then
    converter$ = ReadSetting$(config, "conversor", "libreoffice")
    If converter$ = "" Then
        converter$ = _OpenFileDialog$("Localizar conversor do LibreOffice (soffice.exe)", "", "soffice.exe", "Conversor do LibreOffice")
        If _FileExists(converter$) = 0 Then
            Print "Cannot work directly with PDF files. Provide an FODG file."
            GoTo startover
        Else
            WriteSetting config, "conversor", "libreoffice", converter$
        End If
    End If

    If _FileExists(converter$) Then
        Print "Converting to .fodg format...";
        path$ = Left$(filename$, _InStrRev(filename$, "\") - 1)
        Shell _Hide Chr$(34) + converter$ + Chr$(34) + " --convert-to fodg --outdir " + Chr$(34) + path$ + Chr$(34) + " " + Chr$(34) + filename$ + Chr$(34)
        If _FileExists(Left$(filename$, Len(filename$) - 4) + ".fodg") Then
            filename$ = Left$(filename$, Len(filename$) - 4) + ".fodg"
            Color _RGB32(28, 205, 17)
            Print "done."
            Color _RGB32(255)
        Else
            Color _RGB32(249, 0, 22)
            Print "failed."
            Color _RGB32(255)

            Print "Conversion failed. Cannot work directly with PDF files. Provide an FODG file."
            GoTo startover
        End If
    Else
        Print "Converter not found. Cannot work directly with PDF files. Provide an FODG file."
        GoTo startover
    End If
ElseIf LCase$(Right$(filename$, 5)) = ".fodg" Then
    Print ".FODG file selected."
Else
    Print "Provide a PDF or an FODG file."
    GoTo startover
End If

Dim digits As String * 10
digits = Space$(10)
Asc(digits, 3) = 120
Asc(digits, 4) = 120
choice = 2

Print "Choose digits (space=toggle; a=all/none; enter=confirm):"
PCopy 0, 2

row = CsrLin
Do
    PCopy 2, 0
    k = _KeyHit
    Select Case k
        Case 18432: choice = choice - 1
        Case 20480: choice = choice + 1
        Case 97, 65
            If InStr(digits, " ") > 0 Then digits = String$(10, 120) Else digits = Space$(10)
        Case 32: If Asc(digits, choice + 1) = 120 Then Asc(digits, choice + 1) = 32 Else Asc(digits, choice + 1) = 120
        Case 13: done = true
    End Select
    If choice < 0 Then choice = 9
    If choice > 9 Then choice = 0

    For i = 0 To 9
        Locate i + row, 1
        If choice = i Then Color _RGB32(255) Else Color _RGB32(127)
        Print i;
        Print "["; Mid$(digits$, i + 1, 1); "]";
        If choice = i Then Print "<" Else Print " "
    Next
    _Display
    _Limit 30
Loop Until done

If digits$ = Space$(10) Then Print "Aborted.": End

PCopy 1, 0

Color _RGB32(255)
Locate 3, 1

Open filename$ For Binary As #1
Color _RGB32(127)
Do Until EOF(1)
    Line Input #1, d$
    d$ = _Trim$(d$)

    If InStr(d$, "PerÃ­odo de") Then periodo$ = Mid$(d$, 74, 23)

    If InStr(d$, "Data: ") Then
        EstaData$ = Mid$(d$, InStr(d$, "Data: ") + 6, 10)
    End If

    For checaHora = 8 To 23
        temp$ = Right$("00" + LTrim$(Str$(checaHora)), 2) + ":"
        If InStr(d$, temp$) Then
            EstaHora$ = Mid$(d$, InStr(d$, temp$), 5)
        End If
    Next

    If InStr(d$, ".8.13.") Then
        p$ = Mid$(d$, InStr(d$, ".8.13.") - 15, 25)
        If Asc(digits, Val(Mid$(p$, 7, 1)) + 1) <> 120 Then
            '5002413-74.2024.8.13.0242
            '1234567890123456789012345
            '1;..5;...10...15...20...25
            p$ = ""
        End If
    End If

    If InStr(d$, "CRIMINAL]") Then found$ = p$
    If InStr(d$, "VEL]") Then found$ = ""

    If Len(found$) > 0 And found$ = p$ Then
        l$ = l$ + p$ + "," + EstaData$ + "," + EstaHora$ + lf
        total = total + 1
        Print Left$(p$, 15); "; ";
        p$ = ""
        found$ = ""
    End If

    statusBarG Seek(1), LOF(1), 0, 0, _FontHeight, _Width
    Color _RGB32(0)
    _PrintString (1, 1), "Extracting... " + Str$(total) + " found. "
    Color _RGB32(255)
    _PrintString (0, 0), "Extracting... " + Str$(total) + " found. "
    Color _RGB32(127)

    _Display
Loop
header$ = header$ + "Pauta de Audiências - PJe" + lf
header$ = header$ + "Periodo de " + periodo$ + lf
k = 0
p$ = ""
For i = 1 To 10
    If Asc(digits, i) = 120 Then
        If k > 0 Then p$ = p$ + "," + Str$(i - 1) Else p$ = Str$(i - 1)
        k = k + 1
    End If
Next
header$ = header$ + "Dígitos selecionados: [" + p$ + "]" + lf + lf
header$ = header$ + "Processo,Data,Hora" + lf
_Clipboard$ = header$ + l$
Close #1
Color _RGB32(255)
Print
If Len(l$) Then Print "Copied to clipboard. Hit Enter to copy again."; Else Print "None found.";
_Display

_KeyClear
done = false
i = _LoadImage(_Base64Decode$(check), 32, "memory")
row = CsrLin - 2.5
col = Pos(0)
Do
    k = _KeyHit
    Select Case k
        Case 13
            _Clipboard$ = header$ + l$
            col = col + 3
            If col > 70 Then col = 1: row = row + 3
        Case 27: done = true
    End Select

    If Len(l$) Then
        _PutImage (col * _FontWidth, row * _FontHeight)-Step(_FontWidth * 4, _FontHeight * 3), i
        _Display
    End If

    _Limit 30
Loop Until done
System

Sub statusBarG (value, total, x, y, height, size)
    Dim As Single percentage
    Dim As Integer done

    percentage = value / total
    done = Int(size * percentage)
    Line (x, y)-Step(size, height), _RGB32(0), BF
    If done Then Line (x, y)-Step(done, height), _RGB32(28, 205, 17), BF
End Sub

Function statusBar$ (value, total, size)
    Dim As Single percentage
    Dim As Integer done
    Dim result$
    percentage = value / total
    done = Int(size * percentage)
    If done Then result$ = String$(done, 219)
    result$ = result$ + String$(size - done, 176)
    statusBar$ = result$ + Str$(Int(percentage * 100)) + "%"
End Function

Function indicator$
    Static As Integer state, direction
    Dim chars$

    'chars$ = "|/-\"
    chars$ = "úù" + Chr$(7) + Chr$(9) + ""

    If direction = 0 Then direction = 1
    If state + direction > Len(chars$) Or state + direction < 1 Then direction = -direction
    state = state + direction

    indicator$ = Mid$(chars$, state, 1)
End Function

'$Include:'.\source\utilities\ini-manager\ini.bm'
