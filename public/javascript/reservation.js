// 予約
document.getElementById('reserveBtn').onclick = async () => {
    const reservdt = document.getElementById('reservdt').value;
    const timeslot = document.getElementById('timeslot').value;
    const empno = document.getElementById('empno').value;
    const treatment = document.getElementById('treatment').value;
    const note = document.getElementById('note').value;

    const res = await fetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservdt, timeslot, empno, treatment, note })
    });
    if (res.ok)
    {
        loadList();
    }
    else
    {
        document.getElementById('list').innerText = "データの更新に失敗しました。";
    }
};

// 予約取り消し
document.getElementById('cancelBtn').onclick = async () => {
    const reservdt = document.getElementById('reservdt').value;
    const timeslot = document.getElementById('timeslot').value;
    const res = await fetch('/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservdt, timeslot })
    });
    if (res.ok)
    {
        loadList();
    }
    else
    {
        document.getElementById('list').innerText = "データの更新に失敗しました。";
    }
};

// 予約一覧取得
async function loadList() {
    const res = await fetch('/orders/202609');
    const list = await res.json();

    const div = document.getElementById('list');
    div.innerHTML = list.map(x => `${x.RESERVDT} ${x.TIMESLOT} ${x.EMPNO} ${x.TREATMENT} ${x.NOTE}`).join('<br>');
}

loadList();